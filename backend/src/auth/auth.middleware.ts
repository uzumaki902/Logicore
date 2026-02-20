import type { Request, Response, NextFunction } from "express";
import { readSessionCookie, SessionUser } from "./cookie";
import { read } from "node:fs";
declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = readSessionCookie(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthenticatedd" });
  }
  req.user = user;
  next();
}
