import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./auth/auth.routes";
import authE2ERouter from "./auth/e2e.routes";
async function main() {
  dotenv.config();

  const app = express();

  const allowedOrigins = (
    process.env.FRONTEND_URLS ??
    process.env.FRONTEND_URL ??
    "http://localhost:5173,http://localhost:5175"
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        // Allow non-browser clients (no Origin header)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get("/status", (req, res) => {
    res.json({ ok: "true", status: "UP" });
  });
  app.use("/auth", authRouter);
  app.use("/auth", authE2ERouter);

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
