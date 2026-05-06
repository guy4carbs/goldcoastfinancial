import "dotenv/config";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";

const { Pool } = pkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }

  const sql = readFileSync(
    path.resolve(__dirname, "../migrations/0009_add_director_role.sql"),
    "utf8",
  );

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    console.log("[migrate] applying 0009_add_director_role.sql");
    const before = await client.query(
      "SELECT role, COUNT(*)::int AS n FROM users GROUP BY role ORDER BY role",
    );
    console.log("[migrate] role distribution BEFORE:");
    console.table(before.rows);

    const result = await client.query(sql);
    console.log(`[migrate] UPDATE rowCount: ${result.rowCount ?? 0}`);

    const after = await client.query(
      "SELECT role, COUNT(*)::int AS n FROM users GROUP BY role ORDER BY role",
    );
    console.log("[migrate] role distribution AFTER:");
    console.table(after.rows);

    const managers = await client.query(
      "SELECT COUNT(*)::int AS n FROM users WHERE role = 'manager'",
    );
    if (managers.rows[0].n > 0) {
      console.error(`[migrate] FAIL: ${managers.rows[0].n} 'manager' rows still exist`);
      process.exit(1);
    }
    console.log("[migrate] OK — no 'manager' rows remain");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[migrate] FAILED:", err);
  process.exit(1);
});
