import pkg from "pg";
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ Falta DATABASE_URL");
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false } // Supabase
});

export default pool;
