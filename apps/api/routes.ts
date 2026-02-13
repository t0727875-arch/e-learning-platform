import type { Express } from "express";
import { type Server } from "http";
import { setupAuth, registerAuthRoutes, authStorage } from "./replit_integrations/auth";
import { storage } from "./storage";
import { seedContentData } from "./seed";
import { apiRateLimit } from "./middleware/rate-limit";
import { errorHandler } from "./middleware/error-handler";
import { registerAllRoutes } from "./routes/index";

async function initializeAdminUser() {
  try {
    const existingAdmin = await authStorage.getUserByUsername("admin");
    let adminUserId: string;
    
    if (!existingAdmin) {
      const adminUser = await authStorage.createLocalUser("admin", "admin", "Admin", "User");
      await storage.createUserProfile({
        userId: adminUser.id,
        role: "admin",
        preferredLanguage: "en",
        points: 0,
      });
      console.log("[Admin Init] Admin user created with username: admin, password: admin");
      adminUserId = adminUser.id;
      
      await seedContentData(adminUserId);
    } else {
      adminUserId = existingAdmin.id;
      const profile = await storage.getUserProfile(existingAdmin.id);
      if (!profile) {
        await storage.createUserProfile({
          userId: existingAdmin.id,
          role: "admin",
          preferredLanguage: "en",
          points: 0,
        });
        console.log("[Admin Init] Admin profile created for existing admin user");
      }
      
      const existingPaths = await storage.getPaths();
      if (existingPaths.length === 0) {
        await seedContentData(adminUserId);
      }
    }
  } catch (error) {
    console.error("[Admin Init] Error initializing admin user:", error);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  
  await initializeAdminUser();

  // Apply global API rate limiting
  app.use("/api", apiRateLimit);

  // Register all domain-specific routes
  registerAllRoutes(app);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return httpServer;
}
