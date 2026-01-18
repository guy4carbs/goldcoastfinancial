import { Router } from "express";
import { pool } from "../db";

const router = Router();

// Helper to convert snake_case to camelCase
function toCamelCase(row: any) {
  return {
    id: row.id,
    productType: row.product_type,
    personaName: row.persona_name,
    personaEthnicity: row.persona_ethnicity,
    ageRangeMin: row.age_range_min,
    ageRangeMax: row.age_range_max,
    incomeMin: row.income_min,
    incomeMax: row.income_max,
    familyStatus: row.family_status,
    corePain: row.core_pain,
    primaryTrigger: row.primary_trigger,
    description: row.description,
    features: row.features || [],
    coverageAmounts: row.coverage_amounts || [],
    termLengths: row.term_lengths || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Get all products
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM products ORDER BY product_type, persona_name
    `);

    const products = result.rows.map(toCamelCase);
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = toCamelCase(result.rows[0]);
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Create product
router.post("/", async (req, res) => {
  try {
    const {
      productType,
      personaName,
      personaEthnicity,
      ageRangeMin,
      ageRangeMax,
      incomeMin,
      incomeMax,
      familyStatus,
      corePain,
      primaryTrigger,
      description,
      features,
      coverageAmounts,
      termLengths,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO products (
        product_type, persona_name, persona_ethnicity,
        age_range_min, age_range_max, income_min, income_max,
        family_status, core_pain, primary_trigger, description,
        features, coverage_amounts, term_lengths
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        productType,
        personaName,
        personaEthnicity,
        ageRangeMin,
        ageRangeMax,
        incomeMin,
        incomeMax,
        familyStatus,
        corePain,
        primaryTrigger,
        description || "",
        JSON.stringify(features || []),
        JSON.stringify(coverageAmounts || []),
        JSON.stringify(termLengths || []),
      ]
    );

    const product = toCamelCase(result.rows[0]);
    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Update product
router.put("/:id", async (req, res) => {
  try {
    const {
      productType,
      personaName,
      personaEthnicity,
      ageRangeMin,
      ageRangeMax,
      incomeMin,
      incomeMax,
      familyStatus,
      corePain,
      primaryTrigger,
      description,
      features,
      coverageAmounts,
      termLengths,
    } = req.body;

    const result = await pool.query(
      `UPDATE products SET
        product_type = $1, persona_name = $2, persona_ethnicity = $3,
        age_range_min = $4, age_range_max = $5, income_min = $6, income_max = $7,
        family_status = $8, core_pain = $9, primary_trigger = $10, description = $11,
        features = $12, coverage_amounts = $13, term_lengths = $14,
        updated_at = NOW()
      WHERE id = $15
      RETURNING *`,
      [
        productType,
        personaName,
        personaEthnicity,
        ageRangeMin,
        ageRangeMax,
        incomeMin,
        incomeMax,
        familyStatus,
        corePain,
        primaryTrigger,
        description || "",
        JSON.stringify(features || []),
        JSON.stringify(coverageAmounts || []),
        JSON.stringify(termLengths || []),
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = toCamelCase(result.rows[0]);
    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
