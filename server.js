import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./src/app.js";
import pool from "./src/db/pool.js";

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`API corriendo en puerto ${PORT}`);
});

// cierre elegante
function shutdown(sig) {
  console.log(`\nRecibido ${sig}. Cerrando...`);
  server.close(async () => {
    try { await pool.end(); } catch {}
    process.exit(0);
  });
}
["SIGINT","SIGTERM"].forEach(s => process.on(s, () => shutdown(s)));
