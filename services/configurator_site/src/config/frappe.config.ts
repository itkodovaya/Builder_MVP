/**
 * Frappe Configuration
 * 
 * Configuration for Frappe Service integration
 */

import { validateEnv } from './env.config';

const env = validateEnv();

export interface FrappeConfig {
  serviceUrl: string;
  enabled: boolean;
  timeout: number;
  retryAttempts: number;
}

export const frappeConfig: FrappeConfig = {
  serviceUrl: env.FRAPPE_SERVICE_URL,
  enabled: env.FRAPPE_ENABLED,
  timeout: env.FRAPPE_TIMEOUT_MS,
  retryAttempts: env.FRAPPE_RETRY_ATTEMPTS,
};

/**
 * Get configurator adapter based on configuration
 */
export function getConfiguratorAdapter() {
  if (frappeConfig.enabled) {
    // Dynamic import to avoid loading Frappe adapter if not enabled
    const { FrappeAdapter } = require('../adapters/frappe/frappe.adapter');
    return new FrappeAdapter();
  } else {
    const { FallbackAdapter } = require('../adapters/fallback/fallback.adapter');
    return new FallbackAdapter();
  }
}

