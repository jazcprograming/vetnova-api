import pool from "../db/pool.js";

export async function listar(req, res) {
  const q = String(req.query.q || "").trim();
  const limit = Math.min(parseInt(req.query.limit || "50", 10), 100);
  const offset = Math.max(parseInt(req.query.offset || "0", 10), 0);

  const params = [];
  let sql = "select id, nombre, especie, raza, fecha_nacimiento, created_at from pacientes";
  if (q) { params.push(`%${q}%`); sql += ` where nombre ILIKE $${params.length}`; } // simple sin unaccent
  sql += " order by nombre asc limit $" + (params.push(limit)) + " offset $" + (params.push(offset));

  const data = await pool.query(sql, params);
  const total = q
    ? (await pool.query("select count(*)::int c from pacientes where nombre ILIKE $1", [`%${q}%`])).rows[0].c
    : (await pool.query("select count(*)::int c from pacientes")).rows[0].c;

  res.json({ items: data.rows, pagination: { limit, offset, total } });
}

export async function obtener(req, res) {
  const { id } = req.params;
  const r = await pool.query(
    "select id, nombre, especie, raza, fecha_nacimiento, created_at from pacientes where id = $1",
    [id]
  );
  if (!r.rowCount) return res.status(404).json({ error: "paciente no encontrado" });
  res.json(r.rows[0]);
}

export async function crear(req, res) {
  const { nombre, especie = null, raza = null, fecha_nacimiento = null } = req.body;
  const r = await pool.query(
    `insert into pacientes (id, nombre, especie, raza, fecha_nacimiento)
     values (gen_random_uuid(), $1, $2, $3, $4)
     returning id, nombre, especie, raza, fecha_nacimiento, created_at`,
    [nombre.trim(), especie, raza, fecha_nacimiento]
  );
  res.status(201).json(r.rows[0]);
}

export async function actualizar(req, res) {
  const { id } = req.params;
  const { nombre, especie, raza, fecha_nacimiento } = req.body;

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
      id
    ]
  );
  if (!r.rowCount) return res.status(404).json({ error: "paciente no encontrado" });
  res.json(r.rows[0]);
}

export async function eliminar(req, res) {
  const { id } = req.params;
  const r = await pool.query("delete from pacientes where id = $1", [id]);
  if (!r.rowCount) return res.status(404).json({ error: "paciente no encontrado" });
  res.status(204).send();
}
