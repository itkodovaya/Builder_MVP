/**
 * Global Environment Configuration
 * 
 * Global environment variable validation
 */

import { z } from 'zod';

const globalEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // Add global environment variables here
});

export type GlobalEnvConfig = z.infer<typeof globalEnvSchema>;

export function validateGlobalEnv(): GlobalEnvConfig {
  return globalEnvSchema.parse(process.env);
}

