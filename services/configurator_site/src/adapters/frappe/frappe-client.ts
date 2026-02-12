/**
 * Frappe Client
 * 
 * HTTP client for communicating with Frappe Service
 */

import type {
  FrappeRenderRequest,
  FrappeRenderResponse,
  FrappeValidationRequest,
  FrappeValidationResponse,
  FrappeTemplate,
} from '../../models/frappe-block.model';
import { validateEnv } from '../../config/env.config';
import { logger } from '../../utils/logger.util';

const env = validateEnv();

class FrappeClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'FrappeClientError';
  }
}

export class FrappeClient {
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number;

  constructor() {
    this.baseUrl = env.FRAPPE_SERVICE_URL || 'http://localhost:8000';
    this.timeout = env.FRAPPE_TIMEOUT_MS || 5000;
    this.retryAttempts = env.FRAPPE_RETRY_ATTEMPTS || 3;
  }

  /**
   * Render a page from blocks
   */
  async renderPage(request: FrappeRenderRequest): Promise<FrappeRenderResponse> {
    return this.request<FrappeRenderResponse>('/api/render-page', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Validate blocks
   */
  async validateBlocks(request: FrappeValidationRequest): Promise<FrappeValidationResponse> {
    return this.request<FrappeValidationResponse>('/api/validate-blocks', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get available templates
   */
  async getTemplates(): Promise<FrappeTemplate[]> {
    return this.request<FrappeTemplate[]>('/api/templates', {
      method: 'GET',
    });
  }

  /**
   * Generate preview
   */
  async previewPage(request: FrappeRenderRequest): Promise<FrappeRenderResponse> {
    return this.request<FrappeRenderResponse>('/api/preview', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; service: string }> {
    try {
      return await this.request<{ status: string; service: string }>('/api/health', {
        method: 'GET',
      });
    } catch (error) {
      return { status: 'error', service: 'frappe-service' };
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new FrappeClientError(
            errorData.message || `HTTP ${response.status}`,
            response.status,
            errorData.code
          );
        }

        const data = await response.json();
        return data as T;
      } catch (error) {
        lastError = error as Error;

        if (error instanceof FrappeClientError && error.status >= 400 && error.status < 500) {
          // Don't retry client errors
          throw error;
        }

        if (attempt < this.retryAttempts) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          logger.warn(`Frappe request failed (attempt ${attempt}/${this.retryAttempts}), retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    throw new FrappeClientError(
      `Request failed after ${this.retryAttempts} attempts: ${lastError?.message || 'Unknown error'}`,
      0,
      'RETRY_EXHAUSTED'
    );
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const frappeClient = new FrappeClient();

