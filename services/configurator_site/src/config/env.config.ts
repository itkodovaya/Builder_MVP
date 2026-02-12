/**
 * Environment Configuration
 * 
 * Environment variable validation and configuration
 */

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()).default('3001'),
  SITE_TTL_HOURS: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  MAX_FILE_SIZE: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  UPLOAD_DIR: z.string().default('./uploads'),
  PREVIEW_BASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  REDIS_TTL_EXTEND_ON_READ: z.string().transform((val) => val === 'true').pipe(z.boolean()).default('true'),
  STORAGE_TYPE: z.enum(['redis', 'memory']).default('redis'),
  SITES_API_URL: z.string().url().optional(),
  SITES_API_TOKEN: z.string().optional(),
  SITES_API_TIMEOUT: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  PUBLISH_DIR: z.string().default('./published'),
  PUBLISH_BASE_URL: z.string().url().optional(),
  CSS_MINIFY: z.string().transform((val) => val !== 'false').pipe(z.boolean()).default('true'),
  FRAPPE_SERVICE_URL: z.string().url().default('http://localhost:8000'),
  FRAPPE_ENABLED: z.string().transform((val) => val === 'true').pipe(z.boolean()).default('false'),
  FRAPPE_TIMEOUT_MS: z.string().transform(Number).pipe(z.number().int().positive()).default('5000'),
  FRAPPE_RETRY_ATTEMPTS: z.string().transform(Number).pipe(z.number().int().positive()).default('3'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): EnvConfig {
  return envSchema.parse(process.env);
}

