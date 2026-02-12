/**
 * Environment Configuration
 *
 * Environment variable validation and configuration
 */
import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "test", "production"]>>;
    PORT: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    SITE_TTL_HOURS: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    MAX_FILE_SIZE: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    UPLOAD_DIR: z.ZodDefault<z.ZodString>;
    PREVIEW_BASE_URL: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "production" | "development" | "test";
    PORT: number;
    UPLOAD_DIR: string;
    SITE_TTL_HOURS?: number | undefined;
    MAX_FILE_SIZE?: number | undefined;
    PREVIEW_BASE_URL?: string | undefined;
}, {
    NODE_ENV?: "production" | "development" | "test" | undefined;
    PORT?: string | undefined;
    SITE_TTL_HOURS?: string | undefined;
    MAX_FILE_SIZE?: string | undefined;
    UPLOAD_DIR?: string | undefined;
    PREVIEW_BASE_URL?: string | undefined;
}>;
export type EnvConfig = z.infer<typeof envSchema>;
export declare function validateEnv(): EnvConfig;
export {};
//# sourceMappingURL=env.config.d.ts.map