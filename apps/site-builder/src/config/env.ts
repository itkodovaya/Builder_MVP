/**
 * Environment Configuration
 * 
 * Environment variable validation for the frontend application
 */

import { z } from 'zod';
import { createEnv } from '@t3-oss/env-nextjs';

export const env = createEnv({
  /*
   * ServerSide Environment variables, not available on the client.
   */
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  /*
   * Environment variables available on the client (and server).
   */
  client: {
    NEXT_PUBLIC_APP_NAME: z.string().optional().default('Site Builder'),
    NEXT_PUBLIC_API_URL: z.string().url().optional().default('http://localhost:3001'),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
});

