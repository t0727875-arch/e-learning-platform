import type { Request, Response, NextFunction, RequestHandler } from "express";
import { storage } from "../storage";

export interface AuthenticatedRequest extends Request {
  user?: {
    claims: {
      sub: string;
      email?: string;
      first_name?: string;
      last_name?: string;
      profile_image?: string;
    };
  };
  userProfile?: {
    id: string;
    userId: string;
    role: string;
    preferredLanguage: string | null;
    country: string | null;
    points: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };
}

export type AuthHandler = (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<any>;

export type UserRole = "student" | "teacher" | "admin";

export function requireRole(...allowedRoles: UserRole[]) {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.claims?.sub) {
        return res.status(401).json({ 
          error: "Unauthorized", 
          message: "Authentication required" 
        });
      }

      const userId = req.user.claims.sub;
      let profile = await storage.getUserProfile(userId);
      
      if (!profile) {
        profile = await storage.createUserProfile({
          userId,
          role: "student",
          preferredLanguage: "en",
          points: 0,
        });
      }

      req.userProfile = profile;

      if (!allowedRoles.includes(profile.role as UserRole)) {
        return res.status(403).json({ 
          error: "Forbidden", 
          message: `This action requires one of the following roles: ${allowedRoles.join(", ")}` 
        });
      }

      next();
    } catch (error) {
      console.error("Authorization error:", error);
      res.status(500).json({ 
        error: "Internal Server Error", 
        message: "Failed to verify authorization" 
      });
    }
  };
}

export function requireOwnership(getResourceOwnerId: (req: any) => Promise<string | null>) {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.claims?.sub) {
        return res.status(401).json({ 
          error: "Unauthorized", 
          message: "Authentication required" 
        });
      }

      const userId = req.user.claims.sub;
      const profile = req.userProfile || await storage.getUserProfile(userId);
      
      if (profile?.role === "admin") {
        return next();
      }

      const ownerId = await getResourceOwnerId(req);
      
      if (!ownerId) {
        return res.status(404).json({ 
          error: "Not Found", 
          message: "Resource not found" 
        });
      }

      if (ownerId !== userId) {
        return res.status(403).json({ 
          error: "Forbidden", 
          message: "You do not have permission to access this resource" 
        });
      }

      next();
    } catch (error) {
      console.error("Ownership check error:", error);
      res.status(500).json({ 
        error: "Internal Server Error", 
        message: "Failed to verify ownership" 
      });
    }
  };
}

export function attachUserProfile() {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      if (req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        const profile = await storage.getUserProfile(userId);
        if (profile) {
          req.userProfile = profile;
        }
      }
      next();
    } catch (error) {
      next();
    }
  };
}
