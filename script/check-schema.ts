import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

async function checkSchema() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in .env file");
  }

  console.log("\n🔌 Connecting to Neon database...\n");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool, { schema });

  try {
    // Query to get all tables in the database
    const tablesQuery = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log("📊 DATABASE SCHEMA OVERVIEW");
    console.log("=".repeat(80));
    console.log(`\nDatabase: ${process.env.DATABASE_URL.split('@')[1].split('/')[1]}`);
    console.log(`Total Tables: ${tablesQuery.rows.length}\n`);

    // Get detailed information for each table
    for (const tableRow of tablesQuery.rows) {
      const tableName = tableRow.table_name;

      // Get columns for this table
      const columnsQuery = await pool.query(`
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      // Get constraints for this table
      const constraintsQuery = await pool.query(`
        SELECT
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name
        FROM information_schema.table_constraints tc
        LEFT JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_schema = 'public'
        AND tc.table_name = $1;
      `, [tableName]);

      console.log(`\n📋 Table: ${tableName}`);
      console.log("-".repeat(80));

      console.log("\nColumns:");
      columnsQuery.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`  • ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${nullable}${defaultVal}`);
      });

      if (constraintsQuery.rows.length > 0) {
        console.log("\nConstraints:");
        const constraints = new Map();
        constraintsQuery.rows.forEach(c => {
          if (!constraints.has(c.constraint_name)) {
            constraints.set(c.constraint_name, {
              type: c.constraint_type,
              columns: []
            });
          }
          if (c.column_name) {
            constraints.get(c.constraint_name).columns.push(c.column_name);
          }
        });

        constraints.forEach((value, key) => {
          const cols = value.columns.length > 0 ? ` (${value.columns.join(', ')})` : '';
          console.log(`  • ${value.type.padEnd(20)} ${key}${cols}`);
        });
      }
    }

    // Get foreign key relationships
    const fkQuery = await pool.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name;
    `);

    if (fkQuery.rows.length > 0) {
      console.log("\n\n🔗 FOREIGN KEY RELATIONSHIPS");
      console.log("=".repeat(80));
      fkQuery.rows.forEach(fk => {
        console.log(`${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    }

    // Test connection with a simple query
    const testQuery = await pool.query('SELECT NOW() as current_time');
    console.log("\n\n✅ DATABASE CONNECTION SUCCESSFUL");
    console.log("=".repeat(80));
    console.log(`Server Time: ${testQuery.rows[0].current_time}`);
    console.log("\n");

  } catch (error) {
    console.error("\n❌ ERROR:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

checkSchema().catch(console.error);
