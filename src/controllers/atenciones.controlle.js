import pool from "../db/pool.js";

export async function listar(req, res) {
  const qsrc = req.validated?.query ?? req.query;
  const q = String(qsrc.q || "").trim();
  const limit = Math.min(parseInt(qsrc.limit ?? "50", 10), 100);
  const offset = Math.max(parseInt(qsrc.offset ?? "0", 10), 0);
  const pacienteId = qsrc.paciente_id || null;
  const from = qsrc.from || null;
  const to = qsrc.to || null;

  const params = [];
  let where = [];
  if (q) { params.push(`%${q}%`); where.push(`motivo ILIKE $${params.length}`); }
  if (pacienteId) { params.push(pacienteId); where.push(`paciente_id = $${params.length}`); }
  if (from) { params.push(from); where.push(`atencion_at >= $${params.length}`); }
  if (to) { params.push(to); where.push(`atencion_at <= $${params.length}`); }

  const whereSql = where.length ? `where ${where.join(" and ")}` : "";
  const data = await pool.query(
    `select id, paciente_id, tipo, motivo, notas, precio, atencion_at, created_at, updated_at
     from atenciones
     ${whereSql}
     order by atencion_at desc
     limit $${params.push(limit)} offset $${params.push(offset)}`,
     params
  );

  // total
  const count = await pool.query(
    `select count(*)::int c from atenciones ${whereSql}`, params.slice(0, params.length-2)
  );

  res.json({ items: data.rows, pagination: { limit, offset, total: count.rows[0].c } });
}

export async function obtener(req, res) {
  const { id } = req.validated?.params ?? req.params;
  const r = await pool.query(
    `select id, paciente_id, tipo, motivo, notas, precio, atencion_at, created_at, updated_at
     from atenciones where id = $1`,
    [id]
  );
  if (!r.rowCount) return res.status(404).json({ error: "atención no encontrada" });
  res.json(r.rows[0]);
}

export async function crear(req, res) {
  const body = req.validated?.body ?? req.body;
  const { paciente_id, tipo = null, motivo, notas = null, precio = null, atencion_at = null } = body;

  const r = await pool.query(
    `insert into atenciones (paciente_id, tipo, motivo, notas, precio, atencion_at)
     values ($1, $2, $3, $4, $5, coalesce($6, now()))
     returning id, paciente_id, tipo, motivo, notas, precio, atencion_at, created_at, updated_at`,
    [paciente_id, tipo, motivo, notas, precio, atencion_at]
  );
  res.status(201).json(r.rows[0]);
}

export async function actualizar(req, res) {
  const { id } = req.validated?.params ?? req.params;
  const body = req.validated?.body ?? req.body;
  const { tipo, motivo, notas, precio, atencion_at } = body;

  const r = await pool.query(
    `update atenciones set
       tipo = coalesce($1, tipo),
       motivo = coalesce($2, motivo),
       notas = $3,
       precio = $4,
       atencion_at = coalesce($5, atencion_at)
     where id = $6
     returning id, paciente_id, tipo, motivo, notas, precio, atencion_at, created_at, updated_at`,
    [
      tipo === undefined ? null : tipo,
      motivo === undefined ? null : motivo,
      notas === undefined ? null : notas,
      precio === undefined ? null : precio,
      atencion_at === undefined ? null : atencion_at,
      id
    ]
  );
  if (!r.rowCount) return res.status(404).json({ error: "atención no encontrada" });
  res.json(r.rows[0]);
}

export async function eliminar(req, res) {
  const { id } = req.validated?.params ?? req.params;
  const r = await pool.query(`delete from atenciones where id = $1`, [id]);
  if (!r.rowCount) return res.status(404).json({ error: "atención no encontrada" });
  res.status(204).send();
}
