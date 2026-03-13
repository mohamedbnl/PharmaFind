import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  SEARCH_DEFAULT_RADIUS_KM: z.coerce.number().default(5),
  SEARCH_MAX_RADIUS_KM: z.coerce.number().default(50),
  TRGM_SIMILARITY_THRESHOLD: z.coerce.number().default(0.2),
});

export const env = envSchema.parse(process.env);
