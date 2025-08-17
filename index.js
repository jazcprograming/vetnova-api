import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" })); // luego limítalo a tu dominio de Vercel

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Ruta de prueba
app.get("/health", async (_req, res) => {
  try {
    const r = await pool.query("select now()");
    res.json({ ok: true, time: r.rows[0].now });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log(`API corriendo en puerto ${process.env.PORT || 3000}`)
);
