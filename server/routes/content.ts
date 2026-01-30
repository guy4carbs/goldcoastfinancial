import { Router } from "express";
import { pool } from "../db";

const router = Router();

// Helper functions
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
    publishedAt: row.published_at,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    viewCount: row.view_count,
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
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
  };
}

// ============================================
// PUBLIC BLOG ROUTES
// ============================================

// Get published blog posts (paginated)
router.get("/blog", async (req, res) => {
  try {
    const { category, limit = 12, offset = 0, featured } = req.query;

    let query = `SELECT * FROM blog_posts WHERE status = 'published'`;
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    if (featured === "true") {
      query += ` AND is_featured = true`;
    }

    query += ` ORDER BY published_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM blog_posts WHERE status = 'published'`;
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (category) {
      countQuery += ` AND category = $${countParamIndex++}`;
      countParams.push(category);
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
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

// Get single published blog post by slug
router.get("/blog/:slug", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM blog_posts WHERE slug = $1 AND status = 'published'`,
      [req.params.slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    res.json(blogPostToCamelCase(result.rows[0]));
  } catch (error) {
    console.error("Error fetching blog post:", error);
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
});

// Increment view count
router.post("/blog/:slug/view", async (req, res) => {
  try {
    await pool.query(
      `UPDATE blog_posts SET view_count = view_count + 1 WHERE slug = $1 AND status = 'published'`,
      [req.params.slug]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    res.status(500).json({ error: "Failed to increment view count" });
  }
});

// ============================================
// PUBLIC FAQ ROUTES
// ============================================

// Get all published FAQs
router.get("/faqs", async (req, res) => {
  try {
    const { category } = req.query;

    let query = `SELECT * FROM faqs WHERE status = 'published'`;
    const params: any[] = [];

    if (category && category !== "all") {
      query += ` AND category = $1`;
      params.push(category);
    }

    query += ` ORDER BY category, sort_order ASC`;

    const result = await pool.query(query, params);

    // Group by category
    const faqsByCategory: Record<string, any[]> = {};
    result.rows.forEach((row) => {
      const faq = faqToCamelCase(row);
      if (!faqsByCategory[faq.category]) {
        faqsByCategory[faq.category] = [];
      }
      faqsByCategory[faq.category].push(faq);
    });

    res.json({
      faqs: result.rows.map(faqToCamelCase),
      byCategory: faqsByCategory,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

// ============================================
// PUBLIC PAGE ROUTES
// ============================================

// Get published page by slug
router.get("/pages/:slug", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM pages WHERE slug = $1 AND status = 'published'`,
      [req.params.slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.json(pageToCamelCase(result.rows[0]));
  } catch (error) {
    console.error("Error fetching page:", error);
    res.status(500).json({ error: "Failed to fetch page" });
  }
});

// Get all published pages for a parent (e.g., all sections of "about" page)
router.get("/pages/parent/:parentPage", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM pages WHERE parent_page = $1 AND status = 'published' ORDER BY title`,
      [req.params.parentPage]
    );

    res.json(result.rows.map(pageToCamelCase));
  } catch (error) {
    console.error("Error fetching pages:", error);
    res.status(500).json({ error: "Failed to fetch pages" });
  }
});

export default router;
