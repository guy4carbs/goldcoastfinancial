import "dotenv/config";
import { pool } from "./db";

const quoteEstimates = [
  // Term Life - Young, Healthy
  { productType: "Term Life", ageMin: 25, ageMax: 35, coverageAmount: 250000, termLength: "10 years", gender: "male", smoker: false, healthRating: "excellent", monthlyRate: 15.00, annualRate: 180.00 },
  { productType: "Term Life", ageMin: 25, ageMax: 35, coverageAmount: 250000, termLength: "10 years", gender: "female", smoker: false, healthRating: "excellent", monthlyRate: 12.00, annualRate: 144.00 },
  { productType: "Term Life", ageMin: 25, ageMax: 35, coverageAmount: 500000, termLength: "20 years", gender: "male", smoker: false, healthRating: "excellent", monthlyRate: 25.00, annualRate: 300.00 },
  { productType: "Term Life", ageMin: 25, ageMax: 35, coverageAmount: 500000, termLength: "20 years", gender: "female", smoker: false, healthRating: "excellent", monthlyRate: 20.00, annualRate: 240.00 },
  { productType: "Term Life", ageMin: 25, ageMax: 35, coverageAmount: 1000000, termLength: "30 years", gender: "male", smoker: false, healthRating: "excellent", monthlyRate: 45.00, annualRate: 540.00 },
  { productType: "Term Life", ageMin: 25, ageMax: 35, coverageAmount: 1000000, termLength: "30 years", gender: "female", smoker: false, healthRating: "excellent", monthlyRate: 38.00, annualRate: 456.00 },

  // Term Life - Mid-Career
  { productType: "Term Life", ageMin: 35, ageMax: 50, coverageAmount: 500000, termLength: "20 years", gender: "male", smoker: false, healthRating: "excellent", monthlyRate: 45.00, annualRate: 540.00 },
  { productType: "Term Life", ageMin: 35, ageMax: 50, coverageAmount: 500000, termLength: "20 years", gender: "female", smoker: false, healthRating: "excellent", monthlyRate: 35.00, annualRate: 420.00 },
  { productType: "Term Life", ageMin: 35, ageMax: 50, coverageAmount: 750000, termLength: "20 years", gender: "male", smoker: false, healthRating: "excellent", monthlyRate: 65.00, annualRate: 780.00 },
  { productType: "Term Life", ageMin: 35, ageMax: 50, coverageAmount: 1000000, termLength: "25 years", gender: "male", smoker: false, healthRating: "excellent", monthlyRate: 95.00, annualRate: 1140.00 },
  { productType: "Term Life", ageMin: 35, ageMax: 50, coverageAmount: 1000000, termLength: "25 years", gender: "female", smoker: false, healthRating: "excellent", monthlyRate: 75.00, annualRate: 900.00 },

  // Term Life - Smokers (Higher Rates)
  { productType: "Term Life", ageMin: 25, ageMax: 35, coverageAmount: 500000, termLength: "20 years", gender: "male", smoker: true, healthRating: "good", monthlyRate: 55.00, annualRate: 660.00 },
  { productType: "Term Life", ageMin: 35, ageMax: 50, coverageAmount: 500000, termLength: "20 years", gender: "male", smoker: true, healthRating: "good", monthlyRate: 95.00, annualRate: 1140.00 },

  // Final Expense - Seniors
  { productType: "Final Expense", ageMin: 65, ageMax: 75, coverageAmount: 10000, termLength: "Whole Life", gender: "male", smoker: false, healthRating: "average", monthlyRate: 85.00, annualRate: 1020.00 },
  { productType: "Final Expense", ageMin: 65, ageMax: 75, coverageAmount: 10000, termLength: "Whole Life", gender: "female", smoker: false, healthRating: "average", monthlyRate: 70.00, annualRate: 840.00 },
  { productType: "Final Expense", ageMin: 65, ageMax: 75, coverageAmount: 15000, termLength: "Whole Life", gender: "male", smoker: false, healthRating: "average", monthlyRate: 115.00, annualRate: 1380.00 },
  { productType: "Final Expense", ageMin: 65, ageMax: 75, coverageAmount: 25000, termLength: "Whole Life", gender: "male", smoker: false, healthRating: "average", monthlyRate: 175.00, annualRate: 2100.00 },
  { productType: "Final Expense", ageMin: 75, ageMax: 85, coverageAmount: 10000, termLength: "Whole Life", gender: "male", smoker: false, healthRating: "average", monthlyRate: 145.00, annualRate: 1740.00 },
  { productType: "Final Expense", ageMin: 75, ageMax: 85, coverageAmount: 10000, termLength: "Whole Life", gender: "female", smoker: false, healthRating: "average", monthlyRate: 120.00, annualRate: 1440.00 },

  // Final Expense - Budget Options
  { productType: "Final Expense", ageMin: 60, ageMax: 70, coverageAmount: 5000, termLength: "Whole Life", gender: "male", smoker: false, healthRating: "average", monthlyRate: 45.00, annualRate: 540.00 },
  { productType: "Final Expense", ageMin: 60, ageMax: 70, coverageAmount: 5000, termLength: "Whole Life", gender: "female", smoker: false, healthRating: "average", monthlyRate: 38.00, annualRate: 456.00 },

  // IUL - High Income
  { productType: "IUL", ageMin: 30, ageMax: 50, coverageAmount: 1000000, termLength: "Permanent", gender: "male", smoker: false, healthRating: "excellent", monthlyRate: 450.00, annualRate: 5400.00 },
  { productType: "IUL", ageMin: 30, ageMax: 50, coverageAmount: 1000000, termLength: "Permanent", gender: "female", smoker: false, healthRating: "excellent", monthlyRate: 380.00, annualRate: 4560.00 },
  { productType: "IUL", ageMin: 30, ageMax: 50, coverageAmount: 2000000, termLength: "Permanent", gender: "male", smoker: false, healthRating: "excellent", monthlyRate: 850.00, annualRate: 10200.00 },
  { productType: "IUL", ageMin: 35, ageMax: 60, coverageAmount: 500000, termLength: "Permanent", gender: "male", smoker: false, healthRating: "excellent", monthlyRate: 280.00, annualRate: 3360.00 },
  { productType: "IUL", ageMin: 35, ageMax: 60, coverageAmount: 1000000, termLength: "Permanent", gender: "male", smoker: false, healthRating: "excellent", monthlyRate: 520.00, annualRate: 6240.00 },

  // IUL - Business Owners
  { productType: "IUL", ageMin: 25, ageMax: 45, coverageAmount: 500000, termLength: "Permanent", gender: "male", smoker: false, healthRating: "excellent", monthlyRate: 250.00, annualRate: 3000.00 },
  { productType: "IUL", ageMin: 25, ageMax: 45, coverageAmount: 1000000, termLength: "Permanent", gender: "male", smoker: false, healthRating: "excellent", monthlyRate: 450.00, annualRate: 5400.00 },

  // Mortgage Protection - New Homeowners
  { productType: "Mortgage Protection", ageMin: 21, ageMax: 35, coverageAmount: 250000, termLength: "30 years", gender: "male", smoker: false, healthRating: "excellent", monthlyRate: 30.00, annualRate: 360.00 },
  { productType: "Mortgage Protection", ageMin: 21, ageMax: 35, coverageAmount: 250000, termLength: "30 years", gender: "female", smoker: false, healthRating: "excellent", monthlyRate: 25.00, annualRate: 300.00 },
  { productType: "Mortgage Protection", ageMin: 21, ageMax: 35, coverageAmount: 350000, termLength: "30 years", gender: "male", smoker: false, healthRating: "excellent", monthlyRate: 40.00, annualRate: 480.00 },
  { productType: "Mortgage Protection", ageMin: 21, ageMax: 35, coverageAmount: 500000, termLength: "30 years", gender: "male", smoker: false, healthRating: "excellent", monthlyRate: 55.00, annualRate: 660.00 },

  // Mortgage Protection - Refinancers
  { productType: "Mortgage Protection", ageMin: 30, ageMax: 55, coverageAmount: 300000, termLength: "20 years", gender: "male", smoker: false, healthRating: "excellent", monthlyRate: 45.00, annualRate: 540.00 },
  { productType: "Mortgage Protection", ageMin: 30, ageMax: 55, coverageAmount: 400000, termLength: "25 years", gender: "male", smoker: false, healthRating: "excellent", monthlyRate: 60.00, annualRate: 720.00 },
  { productType: "Mortgage Protection", ageMin: 30, ageMax: 55, coverageAmount: 500000, termLength: "30 years", gender: "male", smoker: false, healthRating: "excellent", monthlyRate: 75.00, annualRate: 900.00 },

  // Mortgage Protection - Single Income
  { productType: "Mortgage Protection", ageMin: 30, ageMax: 55, coverageAmount: 200000, termLength: "20 years", gender: "male", smoker: false, healthRating: "good", monthlyRate: 38.00, annualRate: 456.00 },
  { productType: "Mortgage Protection", ageMin: 30, ageMax: 55, coverageAmount: 300000, termLength: "25 years", gender: "male", smoker: false, healthRating: "good", monthlyRate: 55.00, annualRate: 660.00 },
];

async function seedQuoteEstimates() {
  console.log("Starting quote estimates seeding...");

  try {
    // Clear existing data
    await pool.query("DELETE FROM quote_estimates");
    console.log("Cleared existing quote estimates");

    for (const estimate of quoteEstimates) {
      await pool.query(
        `INSERT INTO quote_estimates (
          product_type, age_min, age_max, coverage_amount, term_length,
          gender, smoker, health_rating, monthly_rate, annual_rate
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          estimate.productType,
          estimate.ageMin,
          estimate.ageMax,
          estimate.coverageAmount,
          estimate.termLength,
          estimate.gender,
          estimate.smoker,
          estimate.healthRating,
          estimate.monthlyRate,
          estimate.annualRate,
        ]
      );
    }

    console.log(`\n✅ Successfully seeded ${quoteEstimates.length} quote estimates!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding quote estimates:", error);
    process.exit(1);
  }
}

seedQuoteEstimates();
