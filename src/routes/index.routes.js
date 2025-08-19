import { Router } from "express";
import pool from "../db/pool.js";
import pacientesRouter from "./pacientes.routes.js";
import atencionesRouter from "./atenciones.routes.js";

const router = Router();

// Ping sin BD
router.get("/ping", (_req, res) => res.json({ ok: true, service: "vetnova-api" }));

// Health con BD
router.get("/health", async (_req, res) => {
  try {
    const r = await pool.query("select now()");
    res.json({ ok: true, time: r.rows[0].now });
  } catch (e) {
    console.error("DB ERROR /health:", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Módulos
router.use("/api/pacientes", pacientesRouter);
router.use("/api/atenciones", atencionesRouter); 

export default router;
