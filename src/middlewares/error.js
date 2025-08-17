export function errorHandler(err, _req, res, _next) {
    const status = err.status || 500;
    const body = { error: err.message || "Error inesperado" };
    if (err.details) body.details = err.details;
    if (process.env.NODE_ENV !== "production") body.stack = err.stack;
    res.status(status).json(body);
  }
  