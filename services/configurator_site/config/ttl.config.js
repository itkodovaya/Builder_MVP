/**
 * TTL Configuration
 *
 * Configuration for temporary site TTL (Time To Live)
 */
export const TTL_CONFIG = {
    DEFAULT_TTL_HOURS: 24,
    CLEANUP_INTERVAL_MINUTES: 60,
};
export function getTTLFromEnv() {
    const ttlHours = process.env.SITE_TTL_HOURS
        ? parseInt(process.env.SITE_TTL_HOURS, 10)
        : TTL_CONFIG.DEFAULT_TTL_HOURS;
    return ttlHours * 60 * 60 * 1000; // Convert to milliseconds
}
//# sourceMappingURL=ttl.config.js.map