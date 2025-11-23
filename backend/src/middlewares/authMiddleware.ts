import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateJWT = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, decoded: any) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded;
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};
