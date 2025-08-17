import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://TU-FRONT.vercel.app"  // pon tu dominio vercel
    ]
  }));

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

// LISTAR pacientes
app.get("/api/pacientes", async (_req, res) => {
    try {
      const r = await pool.query(
        "select id, nombre, especie, raza, fecha_nacimiento from pacientes order by nombre asc"
      );
      res.json(r.rows);
    } catch (e) {
      console.error("DB ERROR /api/pacientes:", e);
      res.status(500).json({ error: e.message });
    }
  });
  
  // CREAR paciente
  app.post("/api/pacientes", async (req, res) => {
    const { nombre, especie, raza, fecha_nacimiento } = req.body || {};
    if (!nombre) return res.status(400).json({ error: "nombre requerido" });
    try {
      const r = await pool.query(
        `insert into pacientes (nombre, especie, raza, fecha_nacimiento)
         values ($1,$2,$3,$4) returning id, nombre, especie, raza, fecha_nacimiento`,
        [nombre, especie ?? null, raza ?? null, fecha_nacimiento ?? null]
      );
      res.status(201).json(r.rows[0]);
    } catch (e) {
      console.error("DB ERROR POST /api/pacientes:", e);
      res.status(500).json({ error: e.message });
    }
  });
  

app.listen(process.env.PORT || 3000, () =>
  console.log(`API corriendo en puerto ${process.env.PORT || 3000}`)
);
