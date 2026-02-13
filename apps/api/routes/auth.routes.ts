import type { Express } from "express";
import { z } from "zod";
import { authStorage } from "../replit_integrations/auth";
import { storage } from "../storage";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/error-handler";

export function registerAuthRoutes(app: Express): void {
  // Email subscription endpoint - creates a student user
  const subscribeSchema = z.object({
    email: z.string().email("Invalid email address"),
  });

  app.post("/api/subscribe", validate(subscribeSchema), asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Check if email already exists as a user
    const existing = await authStorage.getUserByEmail(email);
    if (existing) {
      return res.json({ success: true, message: "Already subscribed" });
    }

    // Create new user with student role (email as username, generate temp password)
    const tempPassword = Math.random().toString(36).slice(-8);
    const user = await authStorage.createLocalUser(email, tempPassword, "", "", email);

    // Create user profile with student role
    await storage.createUserProfile({
      userId: user.id,
      role: "student",
      preferredLanguage: "en",
      points: 0,
    });

    res.json({ success: true, message: "Successfully subscribed" });
  }));

  // Google OAuth redirect (placeholder - requires Google OAuth setup)
  app.get("/api/auth/google", (req, res) => {
    // For now, redirect to login page with a message
    // Full Google OAuth would require setting up Google Cloud credentials
    res.redirect("/login?oauth=google");
  });
}
