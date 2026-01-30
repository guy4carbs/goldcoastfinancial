import { Router } from "express";
import { pool } from "../db";

const router = Router();

// ============================================
// HELPER FUNCTIONS
// ============================================

function blogPostToCamelCase(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category,
    author: row.author,
    featuredImage: row.featured_image,
    readTimeMinutes: row.read_time_minutes,
    isFeatured: row.is_featured,
    status: row.status,
    publishedAt: row.published_at,
    scheduledAt: row.scheduled_at,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    metaKeywords: row.meta_keywords,
    ogImage: row.og_image,
    viewCount: row.view_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  };
}

function faqToCamelCase(row: any) {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category,
    sortOrder: row.sort_order,
    slug: row.slug,
    status: row.status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  };
}

function pageToCamelCase(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    content: row.content,
    pageType: row.page_type,
    parentPage: row.parent_page,
    status: row.status,
    publishedAt: row.published_at,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  };
}

function revisionToCamelCase(row: any) {
  return {
    id: row.id,
    contentType: row.content_type,
    contentId: row.content_id,
    revisionNumber: row.revision_number,
    title: row.title,
    content: row.content,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
    changeDescription: row.change_description,
    changedBy: row.changed_by,
    createdAt: row.created_at,
  };
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

async function createRevision(
  contentType: string,
  contentId: string,
  title: string | null,
  content: string,
  metadata: object | null,
  changeDescription: string,
  changedBy?: string
) {
  // Get current revision number
  const revResult = await pool.query(
    `SELECT COALESCE(MAX(revision_number), 0) + 1 as next_rev
     FROM content_revisions
     WHERE content_type = $1 AND content_id = $2`,
    [contentType, contentId]
  );
  const nextRevision = revResult.rows[0].next_rev;

  await pool.query(
    `INSERT INTO content_revisions
     (content_type, content_id, revision_number, title, content, metadata, change_description, changed_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [contentType, contentId, nextRevision, title, content, metadata ? JSON.stringify(metadata) : null, changeDescription, changedBy]
  );
}

// ============================================
// BLOG POSTS ROUTES
// ============================================

// Get all blog posts (with optional filtering)
router.get("/blog-posts", async (req, res) => {
  try {
    const { status, category, search, limit = 50, offset = 0 } = req.query;

    let query = `SELECT * FROM blog_posts WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR excerpt ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM blog_posts WHERE 1=1`;
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (status) {
      countQuery += ` AND status = $${countParamIndex++}`;
      countParams.push(status);
    }
    if (category) {
      countQuery += ` AND category = $${countParamIndex++}`;
      countParams.push(category);
    }
    if (search) {
      countQuery += ` AND (title ILIKE $${countParamIndex} OR excerpt ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count, 10);

    res.json({
      posts: result.rows.map(blogPostToCamelCase),
      total,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    // Return empty list so UI still works
    res.json({ posts: [], total: 0, limit: 50, offset: 0 });
  }
});

// Get single blog post
router.get("/blog-posts/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM blog_posts WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    // Get revisions
    const revisions = await pool.query(
      `SELECT * FROM content_revisions
       WHERE content_type = 'blog_post' AND content_id = $1
       ORDER BY revision_number DESC`,
      [req.params.id]
    );

    res.json({
      post: blogPostToCamelCase(result.rows[0]),
      revisions: revisions.rows.map(revisionToCamelCase),
    });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
});

// Create blog post
router.post("/blog-posts", async (req, res) => {
  try {
    const {
      title,
      slug: providedSlug,
      excerpt,
      content,
      category,
      author = "Heritage Team",
      featuredImage,
      readTimeMinutes = 5,
      isFeatured = false,
      status = "draft",
      scheduledAt,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImage,
    } = req.body;

    const slug = providedSlug || generateSlug(title);

    // Check for duplicate slug
    const existing = await pool.query("SELECT id FROM blog_posts WHERE slug = $1", [slug]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "A post with this slug already exists" });
    }

    const publishedAt = status === "published" ? new Date() : null;

    const result = await pool.query(
      `INSERT INTO blog_posts
       (slug, title, excerpt, content, category, author, featured_image, read_time_minutes,
        is_featured, status, published_at, scheduled_at, meta_title, meta_description, meta_keywords, og_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [slug, title, excerpt, content, category, author, featuredImage, readTimeMinutes,
       isFeatured, status, publishedAt, scheduledAt, metaTitle, metaDescription, metaKeywords, ogImage]
    );

    const post = blogPostToCamelCase(result.rows[0]);

    // Create initial revision
    await createRevision("blog_post", post.id, title, content, { excerpt, category, author }, "Initial creation");

    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({ error: "Failed to create blog post" });
  }
});

// Update blog post
router.put("/blog-posts/:id", async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      category,
      author,
      featuredImage,
      readTimeMinutes,
      isFeatured,
      status,
      scheduledAt,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImage,
    } = req.body;

    // Get existing post
    const existing = await pool.query("SELECT * FROM blog_posts WHERE id = $1", [req.params.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    // Check slug uniqueness if changed
    if (slug && slug !== existing.rows[0].slug) {
      const slugCheck = await pool.query("SELECT id FROM blog_posts WHERE slug = $1 AND id != $2", [slug, req.params.id]);
      if (slugCheck.rows.length > 0) {
        return res.status(400).json({ error: "A post with this slug already exists" });
      }
    }

    // Determine published_at based on status change
    let publishedAt = existing.rows[0].published_at;
    if (status === "published" && existing.rows[0].status !== "published") {
      publishedAt = new Date();
    }

    const result = await pool.query(
      `UPDATE blog_posts SET
       title = COALESCE($1, title),
       slug = COALESCE($2, slug),
       excerpt = COALESCE($3, excerpt),
       content = COALESCE($4, content),
       category = COALESCE($5, category),
       author = COALESCE($6, author),
       featured_image = $7,
       read_time_minutes = COALESCE($8, read_time_minutes),
       is_featured = COALESCE($9, is_featured),
       status = COALESCE($10, status),
       published_at = $11,
       scheduled_at = $12,
       meta_title = $13,
       meta_description = $14,
       meta_keywords = $15,
       og_image = $16,
       updated_at = NOW()
       WHERE id = $17
       RETURNING *`,
      [title, slug, excerpt, content, category, author, featuredImage, readTimeMinutes,
       isFeatured, status, publishedAt, scheduledAt, metaTitle, metaDescription, metaKeywords, ogImage, req.params.id]
    );

    const post = blogPostToCamelCase(result.rows[0]);

    // Create revision if content changed
    if (content && content !== existing.rows[0].content) {
      await createRevision("blog_post", post.id, title || existing.rows[0].title, content,
        { excerpt, category, author }, "Content updated");
    }

    res.json(post);
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).json({ error: "Failed to update blog post" });
  }
});

// Delete blog post (archive)
router.delete("/blog-posts/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE blog_posts SET status = 'archived', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    res.json({ success: true, message: "Blog post archived" });
  } catch (error) {
    console.error("Error archiving blog post:", error);
    res.status(500).json({ error: "Failed to archive blog post" });
  }
});

// Publish blog post
router.post("/blog-posts/:id/publish", async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE blog_posts SET status = 'published', published_at = NOW(), scheduled_at = NULL, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    res.json(blogPostToCamelCase(result.rows[0]));
  } catch (error) {
    console.error("Error publishing blog post:", error);
    res.status(500).json({ error: "Failed to publish blog post" });
  }
});

// Schedule blog post
router.post("/blog-posts/:id/schedule", async (req, res) => {
  try {
    const { scheduledAt } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({ error: "scheduledAt is required" });
    }

    const scheduleDate = new Date(scheduledAt);
    if (scheduleDate <= new Date()) {
      return res.status(400).json({ error: "Scheduled date must be in the future" });
    }

    const result = await pool.query(
      `UPDATE blog_posts SET status = 'scheduled', scheduled_at = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [scheduledAt, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    res.json(blogPostToCamelCase(result.rows[0]));
  } catch (error) {
    console.error("Error scheduling blog post:", error);
    res.status(500).json({ error: "Failed to schedule blog post" });
  }
});

// Revert to revision
router.post("/blog-posts/:id/revert/:revisionId", async (req, res) => {
  try {
    // Get the revision
    const revision = await pool.query(
      `SELECT * FROM content_revisions WHERE id = $1 AND content_id = $2 AND content_type = 'blog_post'`,
      [req.params.revisionId, req.params.id]
    );

    if (revision.rows.length === 0) {
      return res.status(404).json({ error: "Revision not found" });
    }

    const rev = revision.rows[0];
    const metadata = rev.metadata ? JSON.parse(rev.metadata) : {};

    // Update the post with revision content
    const result = await pool.query(
      `UPDATE blog_posts SET
       title = COALESCE($1, title),
       content = $2,
       excerpt = COALESCE($3, excerpt),
       category = COALESCE($4, category),
       author = COALESCE($5, author),
       updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [rev.title, rev.content, metadata.excerpt, metadata.category, metadata.author, req.params.id]
    );

    // Create a revision for the revert
    await createRevision("blog_post", req.params.id, rev.title, rev.content, metadata,
      `Reverted to revision #${rev.revision_number}`);

    res.json(blogPostToCamelCase(result.rows[0]));
  } catch (error) {
    console.error("Error reverting blog post:", error);
    res.status(500).json({ error: "Failed to revert blog post" });
  }
});

// ============================================
// FAQ ROUTES
// ============================================

// Get all FAQs
router.get("/faqs", async (req, res) => {
  try {
    const { status, category } = req.query;

    let query = `SELECT * FROM faqs WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    query += ` ORDER BY category, sort_order ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows.map(faqToCamelCase));
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    // Return empty list so UI still works
    res.json([]);
  }
});

// Get single FAQ
router.get("/faqs/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM faqs WHERE id = $1", [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "FAQ not found" });
    }

    res.json(faqToCamelCase(result.rows[0]));
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    res.status(500).json({ error: "Failed to fetch FAQ" });
  }
});

// Create FAQ
router.post("/faqs", async (req, res) => {
  try {
    const { question, answer, category, sortOrder = 0, status = "draft" } = req.body;

    const slug = generateSlug(question.substring(0, 50));
    const publishedAt = status === "published" ? new Date() : null;

    // Get max sort order for category if not provided
    let order = sortOrder;
    if (!sortOrder) {
      const maxOrder = await pool.query(
        `SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM faqs WHERE category = $1`,
        [category]
      );
      order = maxOrder.rows[0].next_order;
    }

    const result = await pool.query(
      `INSERT INTO faqs (question, answer, category, sort_order, slug, status, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [question, answer, category, order, slug, status, publishedAt]
    );

    res.status(201).json(faqToCamelCase(result.rows[0]));
  } catch (error) {
    console.error("Error creating FAQ:", error);
    res.status(500).json({ error: "Failed to create FAQ" });
  }
});

// Update FAQ
router.put("/faqs/:id", async (req, res) => {
  try {
    const { question, answer, category, sortOrder, status } = req.body;

    const existing = await pool.query("SELECT * FROM faqs WHERE id = $1", [req.params.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "FAQ not found" });
    }

    let publishedAt = existing.rows[0].published_at;
    if (status === "published" && existing.rows[0].status !== "published") {
      publishedAt = new Date();
    }

    const result = await pool.query(
      `UPDATE faqs SET
       question = COALESCE($1, question),
       answer = COALESCE($2, answer),
       category = COALESCE($3, category),
       sort_order = COALESCE($4, sort_order),
       status = COALESCE($5, status),
       published_at = $6,
       updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [question, answer, category, sortOrder, status, publishedAt, req.params.id]
    );

    res.json(faqToCamelCase(result.rows[0]));
  } catch (error) {
    console.error("Error updating FAQ:", error);
    res.status(500).json({ error: "Failed to update FAQ" });
  }
});

// Delete FAQ
router.delete("/faqs/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM faqs WHERE id = $1 RETURNING id", [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "FAQ not found" });
    }

    res.json({ success: true, message: "FAQ deleted" });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    res.status(500).json({ error: "Failed to delete FAQ" });
  }
});

// Reorder FAQs
router.put("/faqs/reorder", async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, sortOrder }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "items array is required" });
    }

    for (const item of items) {
      await pool.query(
        `UPDATE faqs SET sort_order = $1, updated_at = NOW() WHERE id = $2`,
        [item.sortOrder, item.id]
      );
    }

    res.json({ success: true, message: "FAQs reordered" });
  } catch (error) {
    console.error("Error reordering FAQs:", error);
    res.status(500).json({ error: "Failed to reorder FAQs" });
  }
});

// ============================================
// PAGES ROUTES
// ============================================

// Get all pages
router.get("/pages", async (req, res) => {
  try {
    const { status, parentPage } = req.query;

    let query = `SELECT * FROM pages WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (parentPage) {
      query += ` AND parent_page = $${paramIndex++}`;
      params.push(parentPage);
    }

    query += ` ORDER BY parent_page, title ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows.map(pageToCamelCase));
  } catch (error) {
    console.error("Error fetching pages:", error);
    // Return empty list so UI still works
    res.json([]);
  }
});

// Get single page by ID or slug
router.get("/pages/:idOrSlug", async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    // Try UUID first, then slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const query = isUuid
      ? "SELECT * FROM pages WHERE id = $1"
      : "SELECT * FROM pages WHERE slug = $1";

    const result = await pool.query(query, [idOrSlug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Page not found" });
    }

    // Get revisions
    const revisions = await pool.query(
      `SELECT * FROM content_revisions
       WHERE content_type = 'page' AND content_id = $1
       ORDER BY revision_number DESC`,
      [result.rows[0].id]
    );

    res.json({
      page: pageToCamelCase(result.rows[0]),
      revisions: revisions.rows.map(revisionToCamelCase),
    });
  } catch (error) {
    console.error("Error fetching page:", error);
    res.status(500).json({ error: "Failed to fetch page" });
  }
});

// Create page
router.post("/pages", async (req, res) => {
  try {
    const {
      title,
      slug: providedSlug,
      content,
      pageType,
      parentPage,
      status = "draft",
      metaTitle,
      metaDescription,
    } = req.body;

    const slug = providedSlug || generateSlug(title);

    // Check for duplicate slug
    const existing = await pool.query("SELECT id FROM pages WHERE slug = $1", [slug]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "A page with this slug already exists" });
    }

    const publishedAt = status === "published" ? new Date() : null;

    const result = await pool.query(
      `INSERT INTO pages (slug, title, content, page_type, parent_page, status, published_at, meta_title, meta_description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [slug, title, content, pageType, parentPage, status, publishedAt, metaTitle, metaDescription]
    );

    const page = pageToCamelCase(result.rows[0]);

    // Create initial revision
    await createRevision("page", page.id, title, content, { pageType, parentPage }, "Initial creation");

    res.status(201).json(page);
  } catch (error) {
    console.error("Error creating page:", error);
    res.status(500).json({ error: "Failed to create page" });
  }
});

// Update page
router.put("/pages/:id", async (req, res) => {
  try {
    const {
      title,
      slug,
      content,
      pageType,
      parentPage,
      status,
      metaTitle,
      metaDescription,
    } = req.body;

    const existing = await pool.query("SELECT * FROM pages WHERE id = $1", [req.params.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Page not found" });
    }

    // Check slug uniqueness if changed
    if (slug && slug !== existing.rows[0].slug) {
      const slugCheck = await pool.query("SELECT id FROM pages WHERE slug = $1 AND id != $2", [slug, req.params.id]);
      if (slugCheck.rows.length > 0) {
        return res.status(400).json({ error: "A page with this slug already exists" });
      }
    }

    let publishedAt = existing.rows[0].published_at;
    if (status === "published" && existing.rows[0].status !== "published") {
      publishedAt = new Date();
    }

    const result = await pool.query(
      `UPDATE pages SET
       title = COALESCE($1, title),
       slug = COALESCE($2, slug),
       content = COALESCE($3, content),
       page_type = COALESCE($4, page_type),
       parent_page = $5,
       status = COALESCE($6, status),
       published_at = $7,
       meta_title = $8,
       meta_description = $9,
       updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [title, slug, content, pageType, parentPage, status, publishedAt, metaTitle, metaDescription, req.params.id]
    );

    const page = pageToCamelCase(result.rows[0]);

    // Create revision if content changed
    if (content && content !== existing.rows[0].content) {
      await createRevision("page", page.id, title || existing.rows[0].title, content,
        { pageType, parentPage }, "Content updated");
    }

    res.json(page);
  } catch (error) {
    console.error("Error updating page:", error);
    res.status(500).json({ error: "Failed to update page" });
  }
});

// Delete page
router.delete("/pages/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM pages WHERE id = $1 RETURNING id", [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.json({ success: true, message: "Page deleted" });
  } catch (error) {
    console.error("Error deleting page:", error);
    res.status(500).json({ error: "Failed to delete page" });
  }
});

// ============================================
// CONTENT STATS (for dashboard)
// ============================================

router.get("/stats", async (req, res) => {
  // Return empty stats if database is not available
  const emptyStats = {
    blogPosts: { draft: 0, scheduled: 0, published: 0, archived: 0, total: 0 },
    faqs: { draft: 0, published: 0, total: 0 },
    pages: { draft: 0, published: 0, total: 0 },
  };

  try {
    const [blogStats, faqStats, pageStats] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'draft') as draft,
          COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
          COUNT(*) FILTER (WHERE status = 'published') as published,
          COUNT(*) FILTER (WHERE status = 'archived') as archived,
          COUNT(*) as total
        FROM blog_posts
      `),
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'draft') as draft,
          COUNT(*) FILTER (WHERE status = 'published') as published,
          COUNT(*) as total
        FROM faqs
      `),
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'draft') as draft,
          COUNT(*) FILTER (WHERE status = 'published') as published,
          COUNT(*) as total
        FROM pages
      `),
    ]);

    res.json({
      blogPosts: {
        draft: parseInt(blogStats.rows[0].draft, 10),
        scheduled: parseInt(blogStats.rows[0].scheduled, 10),
        published: parseInt(blogStats.rows[0].published, 10),
        archived: parseInt(blogStats.rows[0].archived, 10),
        total: parseInt(blogStats.rows[0].total, 10),
      },
      faqs: {
        draft: parseInt(faqStats.rows[0].draft, 10),
        published: parseInt(faqStats.rows[0].published, 10),
        total: parseInt(faqStats.rows[0].total, 10),
      },
      pages: {
        draft: parseInt(pageStats.rows[0].draft, 10),
        published: parseInt(pageStats.rows[0].published, 10),
        total: parseInt(pageStats.rows[0].total, 10),
      },
    });
  } catch (error) {
    console.error("Error fetching content stats:", error);
    // Return empty stats instead of error so UI still works
    res.json(emptyStats);
  }
});

export default router;
