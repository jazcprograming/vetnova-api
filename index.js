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
      "https://vetnova-five.vercel.app" 
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

// ======= PACIENTES =======

// util simple para validar UUID (formato v4/v5)
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// LISTAR con paginación y filtro por nombre (?q= & ?limit= & ?offset=)
app.get("/api/pacientes", async (req, res) => {
  const q = (req.query.q || "").toString().trim();
  const limit = Math.min(parseInt(req.query.limit || "50", 10), 100);
  const offset = Math.max(parseInt(req.query.offset || "0", 10), 0);

  try {
    const params = [];
    let sql =
      "select id, nombre, especie, raza, fecha_nacimiento, created_at from pacientes";
    if (q) {
      params.push(`%${q}%`);
      sql += ` where unaccent(lower(nombre)) like unaccent(lower($${params.length}))`;
    }
    sql += " order by nombre asc limit $"+(params.push(limit))+" offset $"+(params.push(offset));
    const data = await pool.query(sql, params);

    // total para paginación (opcional)
    let total = null;
    if (q) {
      const c = await pool.query(
        "select count(*)::int as c from pacientes where unaccent(lower(nombre)) like unaccent(lower($1))",
        [`%${q}%`]
      );
      total = c.rows[0].c;
    } else {
      const c = await pool.query("select count(*)::int as c from pacientes");
      total = c.rows[0].c;
    }

    res.json({ items: data.rows, pagination: { limit, offset, total } });
  } catch (e) {
    console.error("DB ERROR GET /api/pacientes:", e);
    res.status(500).json({ error: "Error listando pacientes" });
  }
});

// OBTENER por id
app.get("/api/pacientes/:id", async (req, res) => {
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(400).json({ error: "id inválido" });

  try {
    const r = await pool.query(
      "select id, nombre, especie, raza, fecha_nacimiento, created_at from pacientes where id = $1",
      [id]
    );
    if (!r.rowCount) return res.status(404).json({ error: "paciente no encontrado" });
    res.json(r.rows[0]);
  } catch (e) {
    console.error("DB ERROR GET /api/pacientes/:id:", e);
    res.status(500).json({ error: "Error obteniendo paciente" });
  }
});

// CREAR
app.post("/api/pacientes", async (req, res) => {
  const { nombre, especie, raza, fecha_nacimiento } = req.body || {};
  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: "nombre requerido" });
  }
  try {
    const r = await pool.query(
      `insert into pacientes (id, nombre, especie, raza, fecha_nacimiento)
       values (gen_random_uuid(), $1, $2, $3, $4)
       returning id, nombre, especie, raza, fecha_nacimiento, created_at`,
      [nombre.trim(), especie ?? null, raza ?? null, fecha_nacimiento ?? null]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    console.error("DB ERROR POST /api/pacientes:", e);
    res.status(500).json({ error: "Error creando paciente" });
  }
});

// EDITAR (PUT) campos: nombre, especie, raza, fecha_nacimiento
app.put("/api/pacientes/:id", async (req, res) => {
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(400).json({ error: "id inválido" });

  const { nombre, especie, raza, fecha_nacimiento } = req.body || {};
  if (nombre !== undefined && !String(nombre).trim()) {
    return res.status(400).json({ error: "nombre no puede ser vacío" });
  }

  try {
    const r = await pool.query(
      `update pacientes set
         nombre = coalesce($1, nombre),
         especie = coalesce($2, especie),
         raza = coalesce($3, raza),
         fecha_nacimiento = coalesce($4, fecha_nacimiento)
       where id = $5
       returning id, nombre, especie, raza, fecha_nacimiento, created_at`,
      [
        nombre === undefined ? null : String(nombre).trim(),
        especie === undefined ? null : especie,
        raza === undefined ? null : raza,
        fecha_nacimiento === undefined ? null : fecha_nacimiento,
        id,
      ]
    );
    if (!r.rowCount) return res.status(404).json({ error: "paciente no encontrado" });
    res.json(r.rows[0]);
  } catch (e) {
    console.error("DB ERROR PUT /api/pacientes/:id:", e);
    res.status(500).json({ error: "Error actualizando paciente" });
  }
});

// ELIMINAR
app.delete("/api/pacientes/:id", async (req, res) => {
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(400).json({ error: "id inválido" });

  try {
    const r = await pool.query("delete from pacientes where id = $1", [id]);
    if (!r.rowCount) return res.status(404).json({ error: "paciente no encontrado" });
    res.status(204).send(); // No Content
  } catch (e) {
    console.error("DB ERROR DELETE /api/pacientes/:id:", e);
    res.status(500).json({ error: "Error eliminando paciente" });
  }
});

  

app.listen(process.env.PORT || 3000, () =>
  console.log(`API corriendo en puerto ${process.env.PORT || 3000}`)
);
