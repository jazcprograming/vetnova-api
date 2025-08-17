import { ZodError } from "zod";

export function validate(schema, where = "body") {
  return (req, _res, next) => {
    try {
      if (!schema) return next();
      const parsed = schema.parse(req[where]); // valida
      // guarda en contenedor propio sin tocar req.query/params/body
      if (!req.validated) req.validated = {};
      req.validated[where] = parsed;
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        return next({ status: 400, message: "Validación falló", details: e.errors });
      }
      next(e);
    }
  };
}
