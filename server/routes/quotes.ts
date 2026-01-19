import { Router } from "express";
import { pool } from "../db";

const router = Router();

interface QuoteRequest {
  productType: string;
  age: number;
  gender: string;
  smoker: boolean;
  coverageAmount: number;
  termLength?: string;
  healthRating: string;
}

interface QuoteEstimate {
  id: number;
  productType: string;
  ageMin: number;
  ageMax: number;
  coverageAmount: number;
  termLength: string | null;
  gender: string | null;
  smoker: boolean;
  healthRating: string;
  monthlyRate: number;
  annualRate: number;
}

function toCamelCase(row: any): QuoteEstimate {
  return {
    id: row.id,
    productType: row.product_type,
    ageMin: row.age_min,
    ageMax: row.age_max,
    coverageAmount: row.coverage_amount,
    termLength: row.term_length,
    gender: row.gender,
    smoker: row.smoker,
    healthRating: row.health_rating,
    monthlyRate: parseFloat(row.monthly_rate),
    annualRate: parseFloat(row.annual_rate),
  };
}

// POST /api/quotes/estimate - Get quote estimate based on user inputs
router.post("/estimate", async (req, res) => {
  try {
    const { productType, age, gender, smoker, coverageAmount, termLength, healthRating }: QuoteRequest = req.body;

    // Validate required fields
    if (!productType || age === undefined || !gender || smoker === undefined || !coverageAmount || !healthRating) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["productType", "age", "gender", "smoker", "coverageAmount", "healthRating"]
      });
    }

    // Build query to find matching estimate
    let query = `
      SELECT * FROM quote_estimates
      WHERE product_type = $1
        AND age_min <= $2
        AND age_max >= $2
        AND coverage_amount = $3
        AND smoker = $4
        AND health_rating = $5
    `;
    const params: any[] = [productType, age, coverageAmount, smoker, healthRating];

    // Add optional filters
    let paramIndex = 6;

    if (gender) {
      query += ` AND (gender = $${paramIndex} OR gender IS NULL)`;
      params.push(gender);
      paramIndex++;
    }

    if (termLength) {
      query += ` AND term_length = $${paramIndex}`;
      params.push(termLength);
    }

    query += ` ORDER BY
      CASE WHEN gender = $${gender ? 6 : 'NULL'} THEN 0 ELSE 1 END,
      monthly_rate ASC
      LIMIT 1
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      // If no exact match, try to find a close match
      const fallbackQuery = `
        SELECT * FROM quote_estimates
        WHERE product_type = $1
          AND age_min <= $2
          AND age_max >= $2
        ORDER BY
          ABS(coverage_amount - $3) ASC,
          monthly_rate ASC
        LIMIT 1
      `;

      const fallbackResult = await pool.query(fallbackQuery, [productType, age, coverageAmount]);

      if (fallbackResult.rows.length === 0) {
        return res.status(404).json({
          error: "No quote estimates found for the given criteria",
          message: "Please contact us for a personalized quote"
        });
      }

      const estimate = toCamelCase(fallbackResult.rows[0]);
      return res.json({
        estimate,
        isApproximate: true,
        message: "This is an approximate estimate. Contact us for an exact quote."
      });
    }

    const estimate = toCamelCase(result.rows[0]);
    res.json({
      estimate,
      isApproximate: false,
      message: "This is an estimate based on your information. Contact us to confirm and lock in your official rate."
    });

  } catch (error) {
    console.error("Error getting quote estimate:", error);
    res.status(500).json({ error: "Failed to get quote estimate" });
  }
});

// GET /api/quotes/products - Get available product types
router.get("/products", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT product_type FROM quote_estimates
      ORDER BY product_type
    `);

    const productTypes = result.rows.map(row => row.product_type);
    res.json(productTypes);
  } catch (error) {
    console.error("Error getting product types:", error);
    res.status(500).json({ error: "Failed to get product types" });
  }
});

// GET /api/quotes/coverage-amounts/:productType - Get available coverage amounts for a product type
router.get("/coverage-amounts/:productType", async (req, res) => {
  try {
    const { productType } = req.params;

    const result = await pool.query(`
      SELECT DISTINCT coverage_amount FROM quote_estimates
      WHERE product_type = $1
      ORDER BY coverage_amount ASC
    `, [productType]);

    const amounts = result.rows.map(row => row.coverage_amount);
    res.json(amounts);
  } catch (error) {
    console.error("Error getting coverage amounts:", error);
    res.status(500).json({ error: "Failed to get coverage amounts" });
  }
});

// GET /api/quotes/term-lengths/:productType - Get available term lengths for a product type
router.get("/term-lengths/:productType", async (req, res) => {
  try {
    const { productType } = req.params;

    const result = await pool.query(`
      SELECT DISTINCT term_length FROM quote_estimates
      WHERE product_type = $1 AND term_length IS NOT NULL
      ORDER BY term_length ASC
    `, [productType]);

    const terms = result.rows.map(row => row.term_length);
    res.json(terms);
  } catch (error) {
    console.error("Error getting term lengths:", error);
    res.status(500).json({ error: "Failed to get term lengths" });
  }
});

export default router;
