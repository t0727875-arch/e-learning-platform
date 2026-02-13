import { z } from "zod";

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("5000"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Session
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),

  // OAuth (optional)
  REPL_ID: z.string().optional(),
  ISSUER_URL: z.string().url().optional(),

  // Admin (optional)
  ADMIN_BOOTSTRAP_USER_ID: z.string().optional(),

  // CORS (optional)
  CORS_ORIGIN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment variables:");
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

// Validate on import
export const env = validateEnv();
