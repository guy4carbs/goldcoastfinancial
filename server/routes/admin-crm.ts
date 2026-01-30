import { Router, Request, Response } from "express";
import { pool } from "../db";

const router = Router();

// =============================================================================
// LEADS / PIPELINE ENDPOINTS
// =============================================================================

/**
 * GET /api/admin/leads
 * Get all leads with optional filtering
 */
router.get("/leads", async (req: Request, res: Response) => {
  try {
    const { status, priority, source, search, sortBy = "created_at", sortOrder = "desc" } = req.query;

    let query = `
      SELECT * FROM leads
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (status && status !== "all") {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (priority && priority !== "all") {
      query += ` AND priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    if (source && source !== "all") {
      query += ` AND source = $${paramIndex}`;
      params.push(source);
      paramIndex++;
    }

    if (search) {
      query += ` AND (
        LOWER(first_name) LIKE LOWER($${paramIndex}) OR
        LOWER(last_name) LIKE LOWER($${paramIndex}) OR
        LOWER(email) LIKE LOWER($${paramIndex}) OR
        LOWER(phone) LIKE LOWER($${paramIndex})
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Validate sort column to prevent SQL injection
    const allowedSortColumns = ["created_at", "updated_at", "first_name", "last_name", "priority", "status", "next_follow_up"];
    const sortColumn = allowedSortColumns.includes(sortBy as string) ? sortBy : "created_at";
    const order = sortOrder === "asc" ? "ASC" : "DESC";

    query += ` ORDER BY ${sortColumn} ${order}`;

    const result = await pool.query(query, params);

    // Get counts by status for pipeline stats
    const statsResult = await pool.query(`
      SELECT
        status,
        COUNT(*) as count
      FROM leads
      GROUP BY status
    `);

    const stats = {
      new: 0,
      contacted: 0,
      quoted: 0,
      follow_up: 0,
      won: 0,
      lost: 0,
      total: result.rows.length,
    };

    statsResult.rows.forEach((row: any) => {
      if (row.status in stats) {
        stats[row.status as keyof typeof stats] = parseInt(row.count);
      }
    });

    res.json({
      leads: result.rows,
      stats,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

/**
 * GET /api/admin/leads/:id
 * Get single lead with activities
 */
router.get("/leads/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const leadResult = await pool.query("SELECT * FROM leads WHERE id = $1", [id]);

    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }

    const activitiesResult = await pool.query(
      "SELECT * FROM lead_activities WHERE lead_id = $1 ORDER BY created_at DESC",
      [id]
    );

    res.json({
      lead: leadResult.rows[0],
      activities: activitiesResult.rows,
    });
  } catch (error) {
    console.error("Error fetching lead:", error);
    res.status(500).json({ error: "Failed to fetch lead" });
  }
});

/**
 * POST /api/admin/leads
 * Create a new lead
 */
router.post("/leads", async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      streetAddress,
      city,
      state,
      zipCode,
      source,
      sourceId,
      status,
      priority,
      coverageType,
      coverageAmount,
      estimatedValue,
      assignedTo,
      nextFollowUp,
      notes,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO leads (
        first_name, last_name, email, phone, street_address, city, state, zip_code,
        source, source_id, status, priority, coverage_type, coverage_amount,
        estimated_value, assigned_to, next_follow_up, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        firstName,
        lastName,
        email,
        phone || null,
        streetAddress || null,
        city || null,
        state || null,
        zipCode || null,
        source || "website",
        sourceId || null,
        status || "new",
        priority || "medium",
        coverageType || null,
        coverageAmount || null,
        estimatedValue || null,
        assignedTo || null,
        nextFollowUp || null,
        notes || null,
      ]
    );

    // Create initial activity
    await pool.query(
      `INSERT INTO lead_activities (lead_id, type, title, description)
       VALUES ($1, 'created', 'Lead Created', $2)`,
      [result.rows[0].id, `Lead created from ${source || "website"}`]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({ error: "Failed to create lead" });
  }
});

/**
 * PUT /api/admin/leads/:id
 * Update a lead
 */
router.put("/leads/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      streetAddress,
      city,
      state,
      zipCode,
      status,
      priority,
      coverageType,
      coverageAmount,
      estimatedValue,
      assignedTo,
      nextFollowUp,
      lastContactedAt,
      lostReason,
      wonAmount,
      wonDate,
      notes,
    } = req.body;

    // Get current lead to track status change
    const currentLead = await pool.query("SELECT status FROM leads WHERE id = $1", [id]);
    const oldStatus = currentLead.rows[0]?.status;

    const result = await pool.query(
      `UPDATE leads SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        street_address = COALESCE($5, street_address),
        city = COALESCE($6, city),
        state = COALESCE($7, state),
        zip_code = COALESCE($8, zip_code),
        status = COALESCE($9, status),
        priority = COALESCE($10, priority),
        coverage_type = COALESCE($11, coverage_type),
        coverage_amount = COALESCE($12, coverage_amount),
        estimated_value = COALESCE($13, estimated_value),
        assigned_to = COALESCE($14, assigned_to),
        next_follow_up = $15,
        last_contacted_at = $16,
        lost_reason = $17,
        won_amount = $18,
        won_date = $19,
        notes = COALESCE($20, notes),
        updated_at = NOW()
      WHERE id = $21
      RETURNING *`,
      [
        firstName,
        lastName,
        email,
        phone,
        streetAddress,
        city,
        state,
        zipCode,
        status,
        priority,
        coverageType,
        coverageAmount,
        estimatedValue,
        assignedTo,
        nextFollowUp || null,
        lastContactedAt || null,
        lostReason || null,
        wonAmount || null,
        wonDate || null,
        notes,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }

    // Log status change activity
    if (status && status !== oldStatus) {
      await pool.query(
        `INSERT INTO lead_activities (lead_id, type, title, old_status, new_status)
         VALUES ($1, 'status_change', 'Status Changed', $2, $3)`,
        [id, oldStatus, status]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({ error: "Failed to update lead" });
  }
});

/**
 * DELETE /api/admin/leads/:id
 * Delete a lead
 */
router.delete("/leads/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM leads WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }

    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({ error: "Failed to delete lead" });
  }
});

/**
 * POST /api/admin/leads/:id/activities
 * Add activity to a lead
 */
router.post("/leads/:id/activities", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, title, description, performedBy } = req.body;

    const result = await pool.query(
      `INSERT INTO lead_activities (lead_id, type, title, description, performed_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, type, title, description || null, performedBy || null]
    );

    // Update last_contacted_at if it's a contact activity
    if (["call", "email", "meeting"].includes(type)) {
      await pool.query("UPDATE leads SET last_contacted_at = NOW(), updated_at = NOW() WHERE id = $1", [id]);
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding activity:", error);
    res.status(500).json({ error: "Failed to add activity" });
  }
});

/**
 * POST /api/admin/leads/convert-quote
 * Convert a quote request to a lead
 */
router.post("/leads/convert-quote/:quoteId", async (req: Request, res: Response) => {
  try {
    const { quoteId } = req.params;

    // Get the quote request
    const quoteResult = await pool.query("SELECT * FROM quote_requests WHERE id = $1", [quoteId]);

    if (quoteResult.rows.length === 0) {
      return res.status(404).json({ error: "Quote request not found" });
    }

    const quote = quoteResult.rows[0];

    // Check if lead already exists for this quote
    const existingLead = await pool.query(
      "SELECT id FROM leads WHERE source_id = $1 AND source = 'quote_form'",
      [quoteId]
    );

    if (existingLead.rows.length > 0) {
      return res.status(400).json({ error: "Lead already exists for this quote", leadId: existingLead.rows[0].id });
    }

    // Create the lead
    const result = await pool.query(
      `INSERT INTO leads (
        first_name, last_name, email, phone, street_address, city, state, zip_code,
        source, source_id, coverage_type, coverage_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'quote_form', $9, $10, $11)
      RETURNING *`,
      [
        quote.first_name,
        quote.last_name,
        quote.email,
        quote.phone,
        quote.street_address,
        quote.city,
        quote.state,
        quote.zip_code,
        quoteId,
        quote.coverage_type,
        quote.coverage_amount,
      ]
    );

    // Create activity
    await pool.query(
      `INSERT INTO lead_activities (lead_id, type, title, description)
       VALUES ($1, 'created', 'Lead Created from Quote Request', 'Converted from quote request submitted on ' || $2)`,
      [result.rows[0].id, quote.created_at]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error converting quote to lead:", error);
    res.status(500).json({ error: "Failed to convert quote to lead" });
  }
});

// =============================================================================
// SITE SETTINGS ENDPOINTS
// =============================================================================

/**
 * GET /api/admin/settings
 * Get all settings, optionally by category
 */
router.get("/settings", async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    let query = "SELECT * FROM site_settings";
    const params: any[] = [];

    if (category && category !== "all") {
      query += " WHERE category = $1";
      params.push(category);
    }

    query += " ORDER BY category, key";

    const result = await pool.query(query, params);

    // Group by category
    const settingsByCategory: Record<string, any[]> = {};
    result.rows.forEach((setting: any) => {
      if (!settingsByCategory[setting.category]) {
        settingsByCategory[setting.category] = [];
      }
      settingsByCategory[setting.category].push(setting);
    });

    res.json({
      settings: result.rows,
      byCategory: settingsByCategory,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

/**
 * GET /api/admin/settings/:key
 * Get a single setting by key
 */
router.get("/settings/:key", async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    const result = await pool.query("SELECT * FROM site_settings WHERE key = $1", [key]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Setting not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching setting:", error);
    res.status(500).json({ error: "Failed to fetch setting" });
  }
});

/**
 * PUT /api/admin/settings/:key
 * Update a single setting
 */
router.put("/settings/:key", async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const result = await pool.query(
      `UPDATE site_settings SET value = $1, updated_at = NOW() WHERE key = $2 RETURNING *`,
      [value, key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Setting not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating setting:", error);
    res.status(500).json({ error: "Failed to update setting" });
  }
});

/**
 * PUT /api/admin/settings
 * Bulk update settings
 */
router.put("/settings", async (req: Request, res: Response) => {
  try {
    const { settings } = req.body; // Array of { key, value }

    if (!Array.isArray(settings)) {
      return res.status(400).json({ error: "Settings must be an array" });
    }

    const results = [];

    for (const setting of settings) {
      const result = await pool.query(
        `UPDATE site_settings SET value = $1, updated_at = NOW() WHERE key = $2 RETURNING *`,
        [setting.value, setting.key]
      );
      if (result.rows.length > 0) {
        results.push(result.rows[0]);
      }
    }

    res.json({ updated: results.length, settings: results });
  } catch (error) {
    console.error("Error bulk updating settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// =============================================================================
// TESTIMONIALS ENDPOINTS
// =============================================================================

/**
 * GET /api/admin/testimonials
 * Get all testimonials with filtering
 */
router.get("/testimonials", async (req: Request, res: Response) => {
  try {
    const { status, featured, category } = req.query;

    let query = "SELECT * FROM testimonials WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (status && status !== "all") {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (featured === "true") {
      query += ` AND is_featured = true`;
    }

    if (category && category !== "all") {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    query += " ORDER BY sort_order ASC, created_at DESC";

    const result = await pool.query(query, params);

    // Get stats
    const statsResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE is_featured = true) as featured
      FROM testimonials
    `);

    res.json({
      testimonials: result.rows,
      stats: statsResult.rows[0],
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
});

/**
 * GET /api/admin/testimonials/:id
 * Get single testimonial
 */
router.get("/testimonials/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM testimonials WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Testimonial not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching testimonial:", error);
    res.status(500).json({ error: "Failed to fetch testimonial" });
  }
});

/**
 * POST /api/admin/testimonials
 * Create a new testimonial
 */
router.post("/testimonials", async (req: Request, res: Response) => {
  try {
    const {
      name,
      title,
      company,
      location,
      photoUrl,
      quote,
      rating,
      category,
      productType,
      status,
      isFeatured,
      showOnHomepage,
      showOnProductPages,
    } = req.body;

    // Get max sort order
    const maxOrderResult = await pool.query("SELECT MAX(sort_order) as max_order FROM testimonials");
    const nextOrder = (maxOrderResult.rows[0].max_order || 0) + 1;

    const result = await pool.query(
      `INSERT INTO testimonials (
        name, title, company, location, photo_url, quote, rating,
        category, product_type, status, is_featured, sort_order,
        show_on_homepage, show_on_product_pages
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        name,
        title || null,
        company || null,
        location || null,
        photoUrl || null,
        quote,
        rating || 5,
        category || null,
        productType || null,
        status || "pending",
        isFeatured || false,
        nextOrder,
        showOnHomepage || false,
        showOnProductPages !== false,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating testimonial:", error);
    res.status(500).json({ error: "Failed to create testimonial" });
  }
});

/**
 * PUT /api/admin/testimonials/:id
 * Update a testimonial
 */
router.put("/testimonials/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      title,
      company,
      location,
      photoUrl,
      quote,
      rating,
      category,
      productType,
      status,
      isFeatured,
      sortOrder,
      showOnHomepage,
      showOnProductPages,
    } = req.body;

    const result = await pool.query(
      `UPDATE testimonials SET
        name = COALESCE($1, name),
        title = $2,
        company = $3,
        location = $4,
        photo_url = $5,
        quote = COALESCE($6, quote),
        rating = COALESCE($7, rating),
        category = $8,
        product_type = $9,
        status = COALESCE($10, status),
        is_featured = COALESCE($11, is_featured),
        sort_order = COALESCE($12, sort_order),
        show_on_homepage = COALESCE($13, show_on_homepage),
        show_on_product_pages = COALESCE($14, show_on_product_pages),
        updated_at = NOW()
      WHERE id = $15
      RETURNING *`,
      [
        name,
        title || null,
        company || null,
        location || null,
        photoUrl || null,
        quote,
        rating,
        category || null,
        productType || null,
        status,
        isFeatured,
        sortOrder,
        showOnHomepage,
        showOnProductPages,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Testimonial not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating testimonial:", error);
    res.status(500).json({ error: "Failed to update testimonial" });
  }
});

/**
 * DELETE /api/admin/testimonials/:id
 * Delete a testimonial
 */
router.delete("/testimonials/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM testimonials WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Testimonial not found" });
    }

    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    res.status(500).json({ error: "Failed to delete testimonial" });
  }
});

/**
 * PUT /api/admin/testimonials/reorder
 * Reorder testimonials
 */
router.put("/testimonials/reorder", async (req: Request, res: Response) => {
  try {
    const { order } = req.body; // Array of { id, sortOrder }

    if (!Array.isArray(order)) {
      return res.status(400).json({ error: "Order must be an array" });
    }

    for (const item of order) {
      await pool.query("UPDATE testimonials SET sort_order = $1 WHERE id = $2", [item.sortOrder, item.id]);
    }

    res.json({ success: true, updated: order.length });
  } catch (error) {
    console.error("Error reordering testimonials:", error);
    res.status(500).json({ error: "Failed to reorder testimonials" });
  }
});

// =============================================================================
// NEWSLETTER SUBSCRIBERS ENDPOINTS
// =============================================================================

// Helper function to map subscriber row to camelCase
function mapSubscriberRow(row: any) {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    status: row.status,
    source: row.source,
    subscribedAt: row.subscribed_at,
    unsubscribedAt: row.unsubscribed_at,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    referrerUrl: row.referrer_url,
    landingPage: row.landing_page,
    confirmToken: row.confirm_token,
    confirmedAt: row.confirmed_at,
    engagementScore: row.engagement_score,
    lastActivityAt: row.last_activity_at,
    customFields: row.custom_fields || {},
    notes: row.notes,
    createdBy: row.created_by,
    updatedAt: row.updated_at,
  };
}

/**
 * GET /api/admin/newsletter
 * Get all subscribers with advanced filtering, search, and pagination
 */
router.get("/newsletter", async (req: Request, res: Response) => {
  try {
    const {
      status,
      source,
      search,
      tagId,
      sortBy = "subscribed_at",
      sortOrder = "desc",
      page = "1",
      limit = "25"
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 25, 100);
    const offset = (pageNum - 1) * limitNum;

    // Build query with dynamic filters
    let query = `
      SELECT DISTINCT ns.*
      FROM newsletter_subscribers ns
      LEFT JOIN subscriber_tag_assignments sta ON ns.id = sta.subscriber_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (status && status !== "all") {
      query += ` AND ns.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (source && source !== "all") {
      query += ` AND ns.source = $${paramIndex}`;
      params.push(source);
      paramIndex++;
    }

    if (search) {
      query += ` AND (
        ns.email ILIKE $${paramIndex} OR
        ns.first_name ILIKE $${paramIndex} OR
        ns.last_name ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (tagId) {
      query += ` AND sta.tag_id = $${paramIndex}`;
      params.push(tagId);
      paramIndex++;
    }

    // Validate sort column
    const allowedSortColumns = ["subscribed_at", "email", "first_name", "last_name", "status", "source", "engagement_score"];
    const sortColumn = allowedSortColumns.includes(sortBy as string) ? sortBy : "subscribed_at";
    const order = sortOrder === "asc" ? "ASC" : "DESC";

    // Count query (without pagination)
    const countQuery = query.replace("SELECT DISTINCT ns.*", "SELECT COUNT(DISTINCT ns.id)");
    const countResult = await pool.query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].count);

    // Add sorting and pagination
    query += ` ORDER BY ns.${sortColumn} ${order}`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limitNum, offset);

    const result = await pool.query(query, params);

    // Get tags for each subscriber
    const subscriberIds = result.rows.map((r: any) => r.id);
    let tagsMap: Record<string, any[]> = {};

    if (subscriberIds.length > 0) {
      const tagsResult = await pool.query(`
        SELECT sta.subscriber_id, st.id, st.name, st.color
        FROM subscriber_tag_assignments sta
        JOIN subscriber_tags st ON sta.tag_id = st.id
        WHERE sta.subscriber_id = ANY($1)
      `, [subscriberIds]);

      tagsResult.rows.forEach((row: any) => {
        if (!tagsMap[row.subscriber_id]) {
          tagsMap[row.subscriber_id] = [];
        }
        tagsMap[row.subscriber_id].push({
          id: row.id,
          name: row.name,
          color: row.color,
        });
      });
    }

    // Get stats
    const statsResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed,
        COUNT(*) FILTER (WHERE status = 'bounced') as bounced,
        COUNT(*) FILTER (WHERE subscribed_at > NOW() - INTERVAL '30 days') as this_month,
        COUNT(*) FILTER (WHERE subscribed_at > NOW() - INTERVAL '7 days') as this_week,
        COUNT(*) FILTER (WHERE unsubscribed_at > NOW() - INTERVAL '30 days') as unsubscribed_this_month
      FROM newsletter_subscribers
    `);

    // Map and include tags
    const subscribers = result.rows.map((row: any) => ({
      ...mapSubscriberRow(row),
      tags: tagsMap[row.id] || [],
    }));

    res.json({
      subscribers,
      stats: {
        total: parseInt(statsResult.rows[0].total),
        active: parseInt(statsResult.rows[0].active),
        unsubscribed: parseInt(statsResult.rows[0].unsubscribed),
        bounced: parseInt(statsResult.rows[0].bounced),
        thisMonth: parseInt(statsResult.rows[0].this_month),
        thisWeek: parseInt(statsResult.rows[0].this_week),
        unsubscribedThisMonth: parseInt(statsResult.rows[0].unsubscribed_this_month),
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
});

/**
 * GET /api/admin/newsletter/stats
 * Get detailed statistics for dashboard
 */
router.get("/newsletter/stats", async (req: Request, res: Response) => {
  try {
    const statsResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed,
        COUNT(*) FILTER (WHERE status = 'bounced') as bounced,
        COUNT(*) FILTER (WHERE subscribed_at > NOW() - INTERVAL '30 days') as this_month,
        COUNT(*) FILTER (WHERE subscribed_at > NOW() - INTERVAL '7 days') as this_week,
        COUNT(*) FILTER (WHERE unsubscribed_at > NOW() - INTERVAL '30 days') as unsubscribed_this_month
      FROM newsletter_subscribers
    `);

    // Get source breakdown
    const sourceResult = await pool.query(`
      SELECT source, COUNT(*) as count
      FROM newsletter_subscribers
      WHERE status = 'active'
      GROUP BY source
      ORDER BY count DESC
    `);

    res.json({
      stats: {
        total: parseInt(statsResult.rows[0].total),
        active: parseInt(statsResult.rows[0].active),
        unsubscribed: parseInt(statsResult.rows[0].unsubscribed),
        bounced: parseInt(statsResult.rows[0].bounced),
        thisMonth: parseInt(statsResult.rows[0].this_month),
        thisWeek: parseInt(statsResult.rows[0].this_week),
        unsubscribedThisMonth: parseInt(statsResult.rows[0].unsubscribed_this_month),
        activeRate: statsResult.rows[0].total > 0
          ? ((parseInt(statsResult.rows[0].active) / parseInt(statsResult.rows[0].total)) * 100).toFixed(1)
          : "0",
        unsubscribeRate: statsResult.rows[0].total > 0
          ? ((parseInt(statsResult.rows[0].unsubscribed) / parseInt(statsResult.rows[0].total)) * 100).toFixed(1)
          : "0",
      },
      sourceBreakdown: sourceResult.rows.map((row: any) => ({
        source: row.source,
        count: parseInt(row.count),
      })),
    });
  } catch (error) {
    console.error("Error fetching newsletter stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

/**
 * GET /api/admin/newsletter/growth
 * Get growth data for charts
 */
router.get("/newsletter/growth", async (req: Request, res: Response) => {
  try {
    const { period = "monthly" } = req.query;

    let dateFormat: string;
    let numPeriods: number;
    let periodType: string;

    switch (period) {
      case "daily":
        dateFormat = "YYYY-MM-DD";
        numPeriods = 30;
        periodType = "day";
        break;
      case "weekly":
        dateFormat = "IYYY-IW";
        numPeriods = 12;
        periodType = "week";
        break;
      default:
        dateFormat = "YYYY-MM";
        numPeriods = 12;
        periodType = "month";
    }

    // Get subscriber counts grouped by period
    const result = await pool.query(`
      SELECT
        TO_CHAR(subscribed_at, $1) as period,
        COUNT(*) as subscribed
      FROM newsletter_subscribers
      WHERE subscribed_at > NOW() - INTERVAL '${numPeriods} ${periodType}s'
      GROUP BY TO_CHAR(subscribed_at, $1)
    `, [dateFormat]);

    // Get unsubscribed counts
    const unsubResult = await pool.query(`
      SELECT
        TO_CHAR(unsubscribed_at, $1) as period,
        COUNT(*) as unsubscribed
      FROM newsletter_subscribers
      WHERE unsubscribed_at IS NOT NULL
        AND unsubscribed_at > NOW() - INTERVAL '${numPeriods} ${periodType}s'
      GROUP BY TO_CHAR(unsubscribed_at, $1)
    `, [dateFormat]);

    // Create lookup maps
    const subscribedMap = new Map(result.rows.map((r: any) => [r.period, parseInt(r.subscribed)]));
    const unsubscribedMap = new Map(unsubResult.rows.map((r: any) => [r.period, parseInt(r.unsubscribed)]));

    // Generate all periods
    const periods: string[] = [];
    const now = new Date();

    for (let i = numPeriods - 1; i >= 0; i--) {
      const date = new Date(now);
      if (periodType === "day") {
        date.setDate(date.getDate() - i);
        periods.push(date.toISOString().split("T")[0]);
      } else if (periodType === "week") {
        date.setDate(date.getDate() - i * 7);
        const year = date.getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const weekNum = Math.ceil((((date.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7);
        periods.push(`${year}-${weekNum.toString().padStart(2, "0")}`);
      } else {
        date.setMonth(date.getMonth() - i);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        periods.push(`${year}-${month}`);
      }
    }

    // Build growth data with all periods
    let cumulative = 0;
    const growthData = periods.map((p) => {
      const subscribed = subscribedMap.get(p) || 0;
      const unsubscribed = unsubscribedMap.get(p) || 0;
      cumulative += subscribed - unsubscribed;

      // Format period label for display
      let displayPeriod = p;
      if (periodType === "day") {
        const d = new Date(p);
        displayPeriod = `${d.getMonth() + 1}/${d.getDate()}`;
      } else if (periodType === "week") {
        displayPeriod = `W${p.split("-")[1]}`;
      } else {
        const [year, month] = p.split("-");
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        displayPeriod = `${monthNames[parseInt(month) - 1]} ${year.slice(2)}`;
      }

      return {
        period: displayPeriod,
        subscribed,
        unsubscribed,
        net: subscribed - unsubscribed,
        cumulative,
      };
    });

    res.json({ growth: growthData });
  } catch (error) {
    console.error("Error fetching growth data:", error);
    res.status(500).json({ error: "Failed to fetch growth data" });
  }
});

/**
 * GET /api/admin/newsletter/tags
 * Get all tags with counts (must be before :id route)
 */
router.get("/newsletter/tags", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT st.*, COUNT(sta.subscriber_id) as actual_count
      FROM subscriber_tags st
      LEFT JOIN subscriber_tag_assignments sta ON st.id = sta.tag_id
      GROUP BY st.id
      ORDER BY st.name ASC
    `);

    res.json({
      tags: result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        color: row.color,
        description: row.description,
        subscriberCount: parseInt(row.actual_count),
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});

/**
 * GET /api/admin/newsletter/export
 * Export subscribers as CSV (must be before :id route)
 */
router.get("/newsletter/export", async (req: Request, res: Response) => {
  try {
    const { status, tagId, fields } = req.query;

    const defaultFields = ["email", "first_name", "last_name", "status", "source", "subscribed_at"];
    const allFields = ["email", "first_name", "last_name", "phone", "status", "source", "subscribed_at", "notes"];
    const selectedFields = fields ? (fields as string).split(",").filter(f => allFields.includes(f)) : defaultFields;

    let query = `SELECT ${selectedFields.join(", ")} FROM newsletter_subscribers ns WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (status && status !== "all") {
      query += ` AND ns.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (tagId) {
      query += ` AND ns.id IN (SELECT subscriber_id FROM subscriber_tag_assignments WHERE tag_id = $${paramIndex})`;
      params.push(tagId);
      paramIndex++;
    }

    query += " ORDER BY ns.subscribed_at DESC";

    const result = await pool.query(query, params);

    const csvRows = [selectedFields.join(",")];
    result.rows.forEach((row: any) => {
      const values = selectedFields.map((header) => {
        const val = row[header] || "";
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    });

    const csv = csvRows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error("Error exporting subscribers:", error);
    res.status(500).json({ error: "Failed to export subscribers" });
  }
});

/**
 * GET /api/admin/newsletter/imports
 * Get import history (must be before :id route)
 */
router.get("/newsletter/imports", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT * FROM subscriber_imports
      ORDER BY created_at DESC
      LIMIT 20
    `);

    res.json({
      imports: result.rows.map((row: any) => ({
        id: row.id,
        filename: row.filename,
        totalRows: row.total_rows,
        importedCount: row.imported_count,
        skippedCount: row.skipped_count,
        errorCount: row.error_count,
        status: row.status,
        importedBy: row.imported_by,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching imports:", error);
    res.status(500).json({ error: "Failed to fetch import history" });
  }
});

/**
 * GET /api/admin/newsletter/:id
 * Get single subscriber with tags and activity
 */
router.get("/newsletter/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Skip if id matches a known sub-route (handled by other routes)
    if (["stats", "growth", "tags", "export", "imports"].includes(id)) {
      return res.status(400).json({ error: "Invalid subscriber ID" });
    }

    const result = await pool.query("SELECT * FROM newsletter_subscribers WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Subscriber not found" });
    }

    // Get tags
    const tagsResult = await pool.query(`
      SELECT st.id, st.name, st.color, sta.assigned_at, sta.assigned_by
      FROM subscriber_tag_assignments sta
      JOIN subscriber_tags st ON sta.tag_id = st.id
      WHERE sta.subscriber_id = $1
    `, [id]);

    // Get activity
    const activityResult = await pool.query(`
      SELECT * FROM subscriber_activity
      WHERE subscriber_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `, [id]);

    res.json({
      subscriber: {
        ...mapSubscriberRow(result.rows[0]),
        tags: tagsResult.rows.map((row: any) => ({
          id: row.id,
          name: row.name,
          color: row.color,
          assignedAt: row.assigned_at,
          assignedBy: row.assigned_by,
        })),
      },
      activity: activityResult.rows.map((row: any) => ({
        id: row.id,
        type: row.activity_type,
        description: row.description,
        metadata: row.metadata,
        performedBy: row.performed_by,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching subscriber:", error);
    res.status(500).json({ error: "Failed to fetch subscriber" });
  }
});

/**
 * POST /api/admin/newsletter
 * Admin add subscriber
 */
router.post("/newsletter", async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, phone, source, notes, tags } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if already exists
    const existing = await pool.query("SELECT * FROM newsletter_subscribers WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Email already subscribed" });
    }

    const result = await pool.query(
      `INSERT INTO newsletter_subscribers (email, first_name, last_name, phone, source, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [email.toLowerCase(), firstName || null, lastName || null, phone || null, source || "admin", notes || null, "admin"]
    );

    const subscriberId = result.rows[0].id;

    // Add tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagId of tags) {
        await pool.query(
          `INSERT INTO subscriber_tag_assignments (subscriber_id, tag_id, assigned_by)
           VALUES ($1, $2, 'admin')
           ON CONFLICT DO NOTHING`,
          [subscriberId, tagId]
        );
      }
      // Update tag counts
      await pool.query(`
        UPDATE subscriber_tags SET subscriber_count = (
          SELECT COUNT(*) FROM subscriber_tag_assignments WHERE tag_id = subscriber_tags.id
        )
      `);
    }

    // Log activity
    await pool.query(
      `INSERT INTO subscriber_activity (subscriber_id, activity_type, description, performed_by)
       VALUES ($1, 'subscribed', 'Added by admin', 'admin')`,
      [subscriberId]
    );

    res.status(201).json({ subscriber: mapSubscriberRow(result.rows[0]) });
  } catch (error) {
    console.error("Error adding subscriber:", error);
    res.status(500).json({ error: "Failed to add subscriber" });
  }
});

/**
 * PUT /api/admin/newsletter/:id
 * Update subscriber
 */
router.put("/newsletter/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, notes, customFields } = req.body;

    const result = await pool.query(
      `UPDATE newsletter_subscribers SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone),
        notes = COALESCE($4, notes),
        custom_fields = COALESCE($5, custom_fields),
        updated_at = NOW()
      WHERE id = $6 RETURNING *`,
      [firstName, lastName, phone, notes, customFields ? JSON.stringify(customFields) : null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Subscriber not found" });
    }

    // Log activity
    await pool.query(
      `INSERT INTO subscriber_activity (subscriber_id, activity_type, description, performed_by)
       VALUES ($1, 'updated', 'Subscriber details updated', 'admin')`,
      [id]
    );

    res.json({ subscriber: mapSubscriberRow(result.rows[0]) });
  } catch (error) {
    console.error("Error updating subscriber:", error);
    res.status(500).json({ error: "Failed to update subscriber" });
  }
});

/**
 * DELETE /api/admin/newsletter/:id
 * Delete a subscriber
 */
router.delete("/newsletter/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM newsletter_subscribers WHERE id = $1 RETURNING id, email", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Subscriber not found" });
    }

    // Update tag counts
    await pool.query(`
      UPDATE subscriber_tags SET subscriber_count = (
        SELECT COUNT(*) FROM subscriber_tag_assignments WHERE tag_id = subscriber_tags.id
      )
    `);

    res.json({ success: true, deleted: result.rows[0].email });
  } catch (error) {
    console.error("Error deleting subscriber:", error);
    res.status(500).json({ error: "Failed to delete subscriber" });
  }
});

/**
 * POST /api/admin/newsletter/:id/unsubscribe
 * Admin unsubscribe
 */
router.post("/newsletter/:id/unsubscribe", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE newsletter_subscribers SET status = 'unsubscribed', unsubscribed_at = NOW(), updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Subscriber not found" });
    }

    // Log activity
    await pool.query(
      `INSERT INTO subscriber_activity (subscriber_id, activity_type, description, performed_by)
       VALUES ($1, 'unsubscribed', 'Unsubscribed by admin', 'admin')`,
      [id]
    );

    res.json({ subscriber: mapSubscriberRow(result.rows[0]) });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

/**
 * POST /api/admin/newsletter/:id/resubscribe
 * Reactivate subscriber
 */
router.post("/newsletter/:id/resubscribe", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE newsletter_subscribers SET status = 'active', unsubscribed_at = NULL, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Subscriber not found" });
    }

    // Log activity
    await pool.query(
      `INSERT INTO subscriber_activity (subscriber_id, activity_type, description, performed_by)
       VALUES ($1, 'resubscribed', 'Resubscribed by admin', 'admin')`,
      [id]
    );

    res.json({ subscriber: mapSubscriberRow(result.rows[0]) });
  } catch (error) {
    console.error("Error resubscribing:", error);
    res.status(500).json({ error: "Failed to resubscribe" });
  }
});

// =============================================================================
// NEWSLETTER BULK OPERATIONS
// =============================================================================

/**
 * POST /api/admin/newsletter/bulk-delete
 * Delete multiple subscribers
 */
router.post("/newsletter/bulk-delete", async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "IDs array is required" });
    }

    const result = await pool.query(
      "DELETE FROM newsletter_subscribers WHERE id = ANY($1) RETURNING id",
      [ids]
    );

    // Update tag counts
    await pool.query(`
      UPDATE subscriber_tags SET subscriber_count = (
        SELECT COUNT(*) FROM subscriber_tag_assignments WHERE tag_id = subscriber_tags.id
      )
    `);

    res.json({ success: true, deleted: result.rows.length });
  } catch (error) {
    console.error("Error bulk deleting:", error);
    res.status(500).json({ error: "Failed to delete subscribers" });
  }
});

/**
 * POST /api/admin/newsletter/bulk-unsubscribe
 * Unsubscribe multiple subscribers
 */
router.post("/newsletter/bulk-unsubscribe", async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "IDs array is required" });
    }

    const result = await pool.query(
      `UPDATE newsletter_subscribers SET status = 'unsubscribed', unsubscribed_at = NOW(), updated_at = NOW()
       WHERE id = ANY($1) RETURNING id`,
      [ids]
    );

    // Log activity for each
    for (const id of ids) {
      await pool.query(
        `INSERT INTO subscriber_activity (subscriber_id, activity_type, description, performed_by)
         VALUES ($1, 'unsubscribed', 'Bulk unsubscribed by admin', 'admin')`,
        [id]
      );
    }

    res.json({ success: true, unsubscribed: result.rows.length });
  } catch (error) {
    console.error("Error bulk unsubscribing:", error);
    res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

/**
 * POST /api/admin/newsletter/bulk-tag
 * Add tag to multiple subscribers
 */
router.post("/newsletter/bulk-tag", async (req: Request, res: Response) => {
  try {
    const { ids, tagId } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "IDs array is required" });
    }
    if (!tagId) {
      return res.status(400).json({ error: "Tag ID is required" });
    }

    let addedCount = 0;
    for (const subscriberId of ids) {
      const result = await pool.query(
        `INSERT INTO subscriber_tag_assignments (subscriber_id, tag_id, assigned_by)
         VALUES ($1, $2, 'admin')
         ON CONFLICT DO NOTHING
         RETURNING subscriber_id`,
        [subscriberId, tagId]
      );
      if (result.rows.length > 0) {
        addedCount++;
        await pool.query(
          `INSERT INTO subscriber_activity (subscriber_id, activity_type, description, metadata, performed_by)
           VALUES ($1, 'tagged', 'Tag added via bulk action', $2, 'admin')`,
          [subscriberId, JSON.stringify({ tagId })]
        );
      }
    }

    // Update tag count
    await pool.query(`
      UPDATE subscriber_tags SET subscriber_count = (
        SELECT COUNT(*) FROM subscriber_tag_assignments WHERE tag_id = $1
      ) WHERE id = $1
    `, [tagId]);

    res.json({ success: true, tagged: addedCount });
  } catch (error) {
    console.error("Error bulk tagging:", error);
    res.status(500).json({ error: "Failed to add tags" });
  }
});

/**
 * POST /api/admin/newsletter/bulk-untag
 * Remove tag from multiple subscribers
 */
router.post("/newsletter/bulk-untag", async (req: Request, res: Response) => {
  try {
    const { ids, tagId } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "IDs array is required" });
    }
    if (!tagId) {
      return res.status(400).json({ error: "Tag ID is required" });
    }

    const result = await pool.query(
      `DELETE FROM subscriber_tag_assignments WHERE subscriber_id = ANY($1) AND tag_id = $2 RETURNING subscriber_id`,
      [ids, tagId]
    );

    // Update tag count
    await pool.query(`
      UPDATE subscriber_tags SET subscriber_count = (
        SELECT COUNT(*) FROM subscriber_tag_assignments WHERE tag_id = $1
      ) WHERE id = $1
    `, [tagId]);

    res.json({ success: true, untagged: result.rows.length });
  } catch (error) {
    console.error("Error bulk untagging:", error);
    res.status(500).json({ error: "Failed to remove tags" });
  }
});

// =============================================================================
// NEWSLETTER TAGS ENDPOINTS
// =============================================================================

/**
 * GET /api/admin/newsletter/tags
 * Get all tags with counts
 */
router.get("/newsletter/tags", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT st.*, COUNT(sta.subscriber_id) as actual_count
      FROM subscriber_tags st
      LEFT JOIN subscriber_tag_assignments sta ON st.id = sta.tag_id
      GROUP BY st.id
      ORDER BY st.name ASC
    `);

    res.json({
      tags: result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        color: row.color,
        description: row.description,
        subscriberCount: parseInt(row.actual_count),
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});

/**
 * POST /api/admin/newsletter/tags
 * Create new tag
 */
router.post("/newsletter/tags", async (req: Request, res: Response) => {
  try {
    const { name, color, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Tag name is required" });
    }

    const result = await pool.query(
      `INSERT INTO subscriber_tags (name, color, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name.trim(), color || "#6366f1", description || null]
    );

    res.status(201).json({
      tag: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        color: result.rows[0].color,
        description: result.rows[0].description,
        subscriberCount: 0,
        createdAt: result.rows[0].created_at,
      },
    });
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "Tag name already exists" });
    }
    console.error("Error creating tag:", error);
    res.status(500).json({ error: "Failed to create tag" });
  }
});

/**
 * PUT /api/admin/newsletter/tags/:id
 * Update tag
 */
router.put("/newsletter/tags/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color, description } = req.body;

    const result = await pool.query(
      `UPDATE subscriber_tags SET
        name = COALESCE($1, name),
        color = COALESCE($2, color),
        description = COALESCE($3, description)
      WHERE id = $4 RETURNING *`,
      [name, color, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tag not found" });
    }

    res.json({
      tag: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        color: result.rows[0].color,
        description: result.rows[0].description,
        subscriberCount: result.rows[0].subscriber_count,
        createdAt: result.rows[0].created_at,
      },
    });
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "Tag name already exists" });
    }
    console.error("Error updating tag:", error);
    res.status(500).json({ error: "Failed to update tag" });
  }
});

/**
 * DELETE /api/admin/newsletter/tags/:id
 * Delete tag
 */
router.delete("/newsletter/tags/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM subscriber_tags WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tag not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting tag:", error);
    res.status(500).json({ error: "Failed to delete tag" });
  }
});

/**
 * POST /api/admin/newsletter/:id/tags
 * Add tags to subscriber
 */
router.post("/newsletter/:id/tags", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tagIds } = req.body;

    if (!tagIds || !Array.isArray(tagIds)) {
      return res.status(400).json({ error: "Tag IDs array is required" });
    }

    for (const tagId of tagIds) {
      await pool.query(
        `INSERT INTO subscriber_tag_assignments (subscriber_id, tag_id, assigned_by)
         VALUES ($1, $2, 'admin')
         ON CONFLICT DO NOTHING`,
        [id, tagId]
      );
    }

    // Update tag counts
    await pool.query(`
      UPDATE subscriber_tags SET subscriber_count = (
        SELECT COUNT(*) FROM subscriber_tag_assignments WHERE tag_id = subscriber_tags.id
      )
    `);

    // Log activity
    await pool.query(
      `INSERT INTO subscriber_activity (subscriber_id, activity_type, description, metadata, performed_by)
       VALUES ($1, 'tagged', 'Tags added', $2, 'admin')`,
      [id, JSON.stringify({ tagIds })]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error adding tags:", error);
    res.status(500).json({ error: "Failed to add tags" });
  }
});

/**
 * DELETE /api/admin/newsletter/:id/tags/:tagId
 * Remove tag from subscriber
 */
router.delete("/newsletter/:id/tags/:tagId", async (req: Request, res: Response) => {
  try {
    const { id, tagId } = req.params;

    await pool.query(
      "DELETE FROM subscriber_tag_assignments WHERE subscriber_id = $1 AND tag_id = $2",
      [id, tagId]
    );

    // Update tag count
    await pool.query(`
      UPDATE subscriber_tags SET subscriber_count = (
        SELECT COUNT(*) FROM subscriber_tag_assignments WHERE tag_id = $1
      ) WHERE id = $1
    `, [tagId]);

    // Log activity
    await pool.query(
      `INSERT INTO subscriber_activity (subscriber_id, activity_type, description, metadata, performed_by)
       VALUES ($1, 'untagged', 'Tag removed', $2, 'admin')`,
      [id, JSON.stringify({ tagId })]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error removing tag:", error);
    res.status(500).json({ error: "Failed to remove tag" });
  }
});

// =============================================================================
// NEWSLETTER IMPORT/EXPORT ENDPOINTS
// =============================================================================

/**
 * GET /api/admin/newsletter/export
 * Export subscribers as CSV with advanced options
 */
router.get("/newsletter/export", async (req: Request, res: Response) => {
  try {
    const { status, tagId, fields } = req.query;

    // Build select fields based on request
    const defaultFields = ["email", "first_name", "last_name", "status", "source", "subscribed_at"];
    const allFields = ["email", "first_name", "last_name", "phone", "status", "source", "subscribed_at", "notes"];
    const selectedFields = fields ? (fields as string).split(",").filter(f => allFields.includes(f)) : defaultFields;

    let query = `SELECT ${selectedFields.join(", ")} FROM newsletter_subscribers ns WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (status && status !== "all") {
      query += ` AND ns.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (tagId) {
      query += ` AND ns.id IN (SELECT subscriber_id FROM subscriber_tag_assignments WHERE tag_id = $${paramIndex})`;
      params.push(tagId);
      paramIndex++;
    }

    query += " ORDER BY ns.subscribed_at DESC";

    const result = await pool.query(query, params);

    // Build CSV
    const csvRows = [selectedFields.join(",")];

    result.rows.forEach((row: any) => {
      const values = selectedFields.map((header) => {
        const val = row[header] || "";
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    });

    const csv = csvRows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error("Error exporting subscribers:", error);
    res.status(500).json({ error: "Failed to export subscribers" });
  }
});

/**
 * POST /api/admin/newsletter/import
 * Import subscribers from CSV data
 */
router.post("/newsletter/import", async (req: Request, res: Response) => {
  try {
    const { subscribers, tagId, updateExisting } = req.body;

    if (!subscribers || !Array.isArray(subscribers)) {
      return res.status(400).json({ error: "Subscribers array is required" });
    }

    // Create import record
    const importRecord = await pool.query(
      `INSERT INTO subscriber_imports (filename, total_rows, status, imported_by, started_at)
       VALUES ($1, $2, 'processing', 'admin', NOW())
       RETURNING id`,
      ["manual_import", subscribers.length]
    );
    const importId = importRecord.rows[0].id;

    let imported = 0;
    let skipped = 0;
    let errors: any[] = [];

    for (const sub of subscribers) {
      if (!sub.email) {
        errors.push({ row: sub, error: "Missing email" });
        continue;
      }

      try {
        // Check if exists
        const existing = await pool.query(
          "SELECT id FROM newsletter_subscribers WHERE email = $1",
          [sub.email.toLowerCase()]
        );

        if (existing.rows.length > 0) {
          if (updateExisting) {
            await pool.query(
              `UPDATE newsletter_subscribers SET
                first_name = COALESCE($1, first_name),
                last_name = COALESCE($2, last_name),
                phone = COALESCE($3, phone),
                updated_at = NOW()
              WHERE email = $4`,
              [sub.firstName, sub.lastName, sub.phone, sub.email.toLowerCase()]
            );
            imported++;

            // Add tag if provided
            if (tagId) {
              await pool.query(
                `INSERT INTO subscriber_tag_assignments (subscriber_id, tag_id, assigned_by)
                 VALUES ($1, $2, 'import')
                 ON CONFLICT DO NOTHING`,
                [existing.rows[0].id, tagId]
              );
            }
          } else {
            skipped++;
          }
        } else {
          // Insert new
          const result = await pool.query(
            `INSERT INTO newsletter_subscribers (email, first_name, last_name, phone, source, created_by)
             VALUES ($1, $2, $3, $4, 'import', 'import')
             RETURNING id`,
            [sub.email.toLowerCase(), sub.firstName || null, sub.lastName || null, sub.phone || null]
          );
          imported++;

          // Add tag if provided
          if (tagId) {
            await pool.query(
              `INSERT INTO subscriber_tag_assignments (subscriber_id, tag_id, assigned_by)
               VALUES ($1, $2, 'import')
               ON CONFLICT DO NOTHING`,
              [result.rows[0].id, tagId]
            );
          }

          // Log activity
          await pool.query(
            `INSERT INTO subscriber_activity (subscriber_id, activity_type, description, metadata, performed_by)
             VALUES ($1, 'imported', 'Imported via CSV', $2, 'admin')`,
            [result.rows[0].id, JSON.stringify({ importId })]
          );
        }
      } catch (err: any) {
        errors.push({ row: sub, error: err.message });
      }
    }

    // Update tag counts
    if (tagId) {
      await pool.query(`
        UPDATE subscriber_tags SET subscriber_count = (
          SELECT COUNT(*) FROM subscriber_tag_assignments WHERE tag_id = $1
        ) WHERE id = $1
      `, [tagId]);
    }

    // Update import record
    await pool.query(
      `UPDATE subscriber_imports SET
        imported_count = $1,
        skipped_count = $2,
        error_count = $3,
        errors = $4,
        status = 'completed',
        completed_at = NOW()
      WHERE id = $5`,
      [imported, skipped, errors.length, JSON.stringify(errors), importId]
    );

    res.json({
      success: true,
      importId,
      imported,
      skipped,
      errors: errors.length,
      errorDetails: errors.slice(0, 10), // Return first 10 errors
    });
  } catch (error) {
    console.error("Error importing subscribers:", error);
    res.status(500).json({ error: "Failed to import subscribers" });
  }
});

/**
 * GET /api/admin/newsletter/imports
 * Get import history
 */
router.get("/newsletter/imports", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT * FROM subscriber_imports
      ORDER BY created_at DESC
      LIMIT 20
    `);

    res.json({
      imports: result.rows.map((row: any) => ({
        id: row.id,
        filename: row.filename,
        totalRows: row.total_rows,
        importedCount: row.imported_count,
        skippedCount: row.skipped_count,
        errorCount: row.error_count,
        status: row.status,
        importedBy: row.imported_by,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching imports:", error);
    res.status(500).json({ error: "Failed to fetch import history" });
  }
});

/**
 * GET /api/admin/newsletter/imports/:id
 * Get import details with errors
 */
router.get("/newsletter/imports/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM subscriber_imports WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Import not found" });
    }

    const row = result.rows[0];
    res.json({
      import: {
        id: row.id,
        filename: row.filename,
        totalRows: row.total_rows,
        importedCount: row.imported_count,
        skippedCount: row.skipped_count,
        errorCount: row.error_count,
        errors: row.errors,
        status: row.status,
        importedBy: row.imported_by,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        createdAt: row.created_at,
      },
    });
  } catch (error) {
    console.error("Error fetching import details:", error);
    res.status(500).json({ error: "Failed to fetch import details" });
  }
});

/**
 * POST /api/newsletter/subscribe
 * Enhanced public endpoint to subscribe
 */
router.post("/newsletter/subscribe", async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, phone, source, landingPage, referrerUrl } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Get IP and user agent
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    // Check if already subscribed
    const existing = await pool.query("SELECT * FROM newsletter_subscribers WHERE email = $1", [email.toLowerCase()]);

    if (existing.rows.length > 0) {
      if (existing.rows[0].status === "unsubscribed") {
        // Resubscribe
        await pool.query(
          `UPDATE newsletter_subscribers SET
            status = 'active',
            unsubscribed_at = NULL,
            updated_at = NOW()
          WHERE email = $1`,
          [email.toLowerCase()]
        );

        // Log activity
        await pool.query(
          `INSERT INTO subscriber_activity (subscriber_id, activity_type, description, performed_by)
           VALUES ($1, 'resubscribed', 'User resubscribed', 'user')`,
          [existing.rows[0].id]
        );

        return res.json({ success: true, message: "Welcome back! You've been resubscribed." });
      }
      return res.json({ success: true, message: "You're already subscribed!" });
    }

    // Insert new subscriber
    const result = await pool.query(
      `INSERT INTO newsletter_subscribers
        (email, first_name, last_name, phone, source, landing_page, referrer_url, ip_address, user_agent, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'user')
       RETURNING id`,
      [
        email.toLowerCase(),
        firstName || null,
        lastName || null,
        phone || null,
        source || "website",
        landingPage || null,
        referrerUrl || null,
        ipAddress,
        userAgent,
      ]
    );

    // Log activity
    await pool.query(
      `INSERT INTO subscriber_activity (subscriber_id, activity_type, description, metadata, performed_by)
       VALUES ($1, 'subscribed', 'Subscribed via website', $2, 'user')`,
      [result.rows[0].id, JSON.stringify({ source: source || "website", landingPage })]
    );

    res.status(201).json({ success: true, message: "Thanks for subscribing!" });
  } catch (error) {
    console.error("Error subscribing:", error);
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

// =============================================================================
// PUBLIC ENDPOINTS (No Auth Required)
// =============================================================================

/**
 * GET /api/admin/public/testimonials
 * Get approved testimonials for public display
 */
router.get("/public/testimonials", async (req: Request, res: Response) => {
  try {
    const { showOnHomepage, showOnProductPages, productType, limit } = req.query;

    let query = "SELECT * FROM testimonials WHERE status = 'approved'";
    const params: any[] = [];
    let paramIndex = 1;

    if (showOnHomepage === "true") {
      query += ` AND show_on_homepage = true`;
    }

    if (showOnProductPages === "true") {
      query += ` AND show_on_product_pages = true`;
    }

    if (productType && productType !== "all") {
      query += ` AND product_type = $${paramIndex}`;
      params.push(productType);
      paramIndex++;
    }

    query += " ORDER BY is_featured DESC, sort_order ASC, created_at DESC";

    if (limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(parseInt(limit as string));
    }

    const result = await pool.query(query, params);

    // Map to camelCase for frontend
    const testimonials = result.rows.map((t: any) => ({
      id: t.id,
      name: t.name,
      title: t.title,
      company: t.company,
      location: t.location,
      photoUrl: t.photo_url,
      quote: t.quote,
      rating: t.rating,
      category: t.category,
      productType: t.product_type,
      isFeatured: t.is_featured,
      dateReceived: t.date_received,
    }));

    res.json(testimonials);
  } catch (error) {
    console.error("Error fetching public testimonials:", error);
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
});

/**
 * GET /api/admin/public/settings
 * Get all public site settings
 */
router.get("/public/settings", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT key, value FROM site_settings");

    // Convert to key-value object for easy access
    const settings: Record<string, string> = {};
    result.rows.forEach((row: any) => {
      settings[row.key] = row.value;
    });

    res.json(settings);
  } catch (error) {
    console.error("Error fetching public settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// =============================================================================
// DASHBOARD STATS ENDPOINT
// =============================================================================

/**
 * GET /api/admin/dashboard-stats
 * Get comprehensive stats for the dashboard
 */
router.get("/dashboard-stats", async (req: Request, res: Response) => {
  try {
    // Lead stats
    const leadStats = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'new') as new,
        COUNT(*) FILTER (WHERE status = 'contacted') as contacted,
        COUNT(*) FILTER (WHERE status = 'quoted') as quoted,
        COUNT(*) FILTER (WHERE status = 'follow_up') as follow_up,
        COUNT(*) FILTER (WHERE status = 'won') as won,
        COUNT(*) FILTER (WHERE status = 'lost') as lost,
        COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as new_today,
        COUNT(*) FILTER (WHERE status NOT IN ('won', 'lost')) as active,
        COUNT(*) FILTER (WHERE next_follow_up::date <= CURRENT_DATE AND status NOT IN ('won', 'lost')) as need_follow_up,
        COALESCE(SUM(won_amount) FILTER (WHERE status = 'won' AND won_date > NOW() - INTERVAL '30 days'), 0) as won_value
      FROM leads
    `);

    // Testimonial stats
    const testimonialStats = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE is_featured = true) as featured
      FROM testimonials
    `);

    // Newsletter stats
    const newsletterStats = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE subscribed_at > NOW() - INTERVAL '30 days') as this_month
      FROM newsletter_subscribers
    `);

    // Content stats
    const contentStats = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'published') as published_posts,
        COUNT(*) FILTER (WHERE status = 'draft') as draft_posts
      FROM blog_posts
    `);

    const stats = leadStats.rows[0];

    res.json({
      leads: {
        total: parseInt(stats.total) || 0,
        newToday: parseInt(stats.new_today) || 0,
        active: parseInt(stats.active) || 0,
        wonValue: parseInt(stats.won_value) || 0,
        needFollowUp: parseInt(stats.need_follow_up) || 0,
      },
      testimonials: {
        total: parseInt(testimonialStats.rows[0].total) || 0,
        pending: parseInt(testimonialStats.rows[0].pending) || 0,
        approved: parseInt(testimonialStats.rows[0].approved) || 0,
        featured: parseInt(testimonialStats.rows[0].featured) || 0,
      },
      newsletter: newsletterStats.rows[0],
      content: {
        publishedPosts: parseInt(contentStats.rows[0]?.published_posts) || 0,
        draftPosts: parseInt(contentStats.rows[0]?.draft_posts) || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
