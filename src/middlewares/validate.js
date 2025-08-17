import { ZodError } from "zod";

export function validate(schema, where = "body") {
  return (req, _res, next) => {
    try {
      if (!schema) return next();
      req[where] = schema.parse(req[where]);
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        return next({ status: 400, message: "Validación falló", details: e.errors });
      }
      next(e);
    }
  };
}
