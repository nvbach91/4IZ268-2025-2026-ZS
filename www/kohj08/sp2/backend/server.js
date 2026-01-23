// backend/server.js
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import healthRouter from "./src/routes/health.route.js";
import delaysRouter from "./src/routes/delays.route.js";
import weatherRouter from "./src/routes/weather.route.js";
import aiSummaryRouter from "./src/routes/aiSummary.route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always load .env next to server.js (reliable regardless of CWD)
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = Number(process.env.PORT || 3000);

/* ---------------- CORS ----------------
   ESO frontend běží na: https://eso.vse.cz (path /~kohj08/sp2/frontend je pořád stejný origin)
   => do CORS patří jen origin: scheme + host (+port)
*/
const ALLOWED_ORIGINS = [
  "https://eso.vse.cz",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // když request nemá Origin (např. curl / server-to-server), necháme ho být
  if (!origin) return next();

  // povol jen známé origins
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    // credentials nepotřebuješ (nepoužíváš cookies/auth), ale nevadí
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Preflight request
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

/* ------------------------------------- */

// serve frontend (lokální režim)
//
app.use(express.static(path.join(__dirname, "..", "frontend")));

// routes
app.use("/api/health", healthRouter);
app.use("/api/delays", delaysRouter);
app.use("/api/weather", weatherRouter);
app.use("/api/ai-summary", aiSummaryRouter);

app.listen(PORT, () => {
  console.log(`Prague HEAT backend running on http://localhost:${PORT}`);
  console.log(`Try: http://localhost:${PORT}/api/health`);
  console.log(`Try: http://localhost:${PORT}/api/delays/dashboard`);
  console.log(`Try: http://localhost:${PORT}/api/weather`);
  console.log(`Try: http://localhost:${PORT}/api/ai-summary`);
});