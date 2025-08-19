import { Router } from "express";
import * as ctrl from "../controllers/atenciones.controller.js";
import { validate } from "../middlewares/validate.js";
import { asyncWrap } from "../middlewares/async.js";
import {
  idSchema,
  queryListSchema,
  createAtencionSchema,
  updateAtencionSchema
} from "../schemas/atenciones.schema.js";

const r = Router();

r.get("/", validate(queryListSchema, "query"), asyncWrap(ctrl.listar));
r.get("/:id", validate(idSchema, "params"), asyncWrap(ctrl.obtener));
r.post("/", validate(createAtencionSchema), asyncWrap(ctrl.crear));
r.put("/:id", validate(idSchema, "params"), validate(updateAtencionSchema), asyncWrap(ctrl.actualizar));
r.delete("/:id", validate(idSchema, "params"), asyncWrap(ctrl.eliminar));

export default r;
    