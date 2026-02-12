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
});
export function validateEnv() {
    return envSchema.parse(process.env);
}
//# sourceMappingURL=env.config.js.map