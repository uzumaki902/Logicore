import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { dot } from "node:test/reporters";
import authRouter from "./auth/auth.routes";

async function main() {
  dotenv.config();

  const app = express();
  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get("status", (req, res) => {
    res.json({ ok: "true", status: "UP" });
  });
  app.use("auth", authRouter);

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
