import "dotenv/config";
import { pool } from "../server/db";
async function main(){
  const r = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name=$1 ORDER BY ordinal_position`, ['lead_activities']);
  console.log("lead_activities columns:", r.rows.map(x=>x.column_name).join(", ") || "(table missing)");
  await pool.end();
}
main();
