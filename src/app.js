import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index.routes.js";

const app = express();

// Middlewares globales
app.use(helmet());
app.use(express.json());

// CORS (ajusta dominios)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://vetnova-five.vercel.app"
  ]
}));

app.use(morgan("dev"));

// Rutas
app.use(routes);

export default app;
