import type { Express } from "express";
import { registerAuthRoutes } from "./auth.routes";
import { registerUserRoutes } from "./user.routes";
import { registerContentRoutes } from "./content.routes";
import { registerQuizRoutes } from "./quiz.routes";
import { registerClassroomRoutes } from "./classroom.routes";
import { registerAdminRoutes } from "./admin.routes";

/**
 * Register all application routes
 * This aggregator imports and calls all domain-specific route registration functions
 */
export function registerAllRoutes(app: Express): void {
  // Register authentication routes
  registerAuthRoutes(app);

  // Register user profile and progress routes
  registerUserRoutes(app);

  // Register content routes (paths, courses, content nodes)
  registerContentRoutes(app);

  // Register quiz routes
  registerQuizRoutes(app);

  // Register classroom routes
  registerClassroomRoutes(app);

  // Register admin routes (must be last for proper route priority)
  registerAdminRoutes(app);
}
