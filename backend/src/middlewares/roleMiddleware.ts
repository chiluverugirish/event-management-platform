import { Request, Response, NextFunction } from "express";

// Extend Express Request to include user info from JWT
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userRole?: string;
    }
  }
}

/**
 * Middleware to check if user has required role(s)
 * Usage: checkRole(['admin', 'organizer'])
 */
export const checkRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRole = req.userRole;

      if (!userRole) {
        return res.status(401).json({ 
          message: "Unauthorized - No role information" 
        });
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          message: `Forbidden - Requires one of these roles: ${allowedRoles.join(', ')}`,
          yourRole: userRole
        });
      }

      next();
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error checking role", 
        error: error.message 
      });
    }
  };
};

/**
 * Middleware to check if user is admin
 */
export const isAdmin = checkRole(['admin']);

/**
 * Middleware to check if user is admin or organizer
 */
export const isAdminOrOrganizer = checkRole(['admin', 'organizer']);
