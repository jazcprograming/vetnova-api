import { Router } from "express";
import * as ctrl from "../controllers/pacientes.controller.js";
import { validate } from "../middlewares/validate.js";
import { createPacienteSchema, updatePacienteSchema, idSchema, queryListSchema } from "../schemas/pacientes.schema.js";
import { asyncWrap } from "../middlewares/async.js";

const r = Router();

// listar
r.get("/", validate(queryListSchema, "query"), asyncWrap(ctrl.listar));

// obtener
r.get("/:id", validate(idSchema, "params"), asyncWrap(ctrl.obtener));

// crear
r.post("/", validate(createPacienteSchema), asyncWrap(ctrl.crear));

// actualizar
r.put("/:id", validate(idSchema, "params"), validate(updatePacienteSchema), asyncWrap(ctrl.actualizar));

// eliminar
r.delete("/:id", validate(idSchema, "params"), asyncWrap(ctrl.eliminar));

export default r;
