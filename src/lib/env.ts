import { z } from "zod";

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_SENTRY_DSN: z.string().url().optional(),
  VITE_POSTHOG_KEY: z.string().optional(),
});

export function validateEnv() {
  try {
    envSchema.parse(import.meta.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Invalid environment variables:");
      error.errors.forEach((err) => {
        console.error(`- ${err.path.join(".")}: ${err.message}`);
      });
      throw new Error("Invalid environment variables");
    }
    throw error;
  }
}
