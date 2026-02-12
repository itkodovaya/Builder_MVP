/**
 * Configurator API Client
 * 
 * Client for interacting with the site configurator backend service
 */

import { env } from '@/config/env';

const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

export interface CreateSiteRequest {
  brandName: string;
  industry: string;
  templateId?: string;
  logo?: {
    filename: string;
    mimeType: string;
    size: number;
  };
}

export interface Site {
  id: string;
  brandName: string;
  industry: string;
  logo?: {
    id: string;
    filename: string;
    url: string;
  };
  config: Record<string, unknown>;
  isTemporary: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PreviewResponse {
  url: string;
  siteId: string;
}

export interface PreviewJson {
  // Полный HTML-документ (с DOCTYPE, <html>, <head>, <body>)
  html: string;
  assets?: Record<string, string>;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError(
      'API_BASE_URL is not configured',
      500,
      'CONFIG_ERROR'
    );
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('API Request:', { 
    method: options?.method || 'GET', 
    url, 
    body: options?.body ? JSON.parse(options.body as string) : undefined 
  });
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    console.log('API Response:', { 
      status: response.status, 
      statusText: response.statusText, 
      url,
      ok: response.ok 
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error('API Error Response:', errorData);
      } catch {
        errorData = { 
          message: response.statusText,
          error: { message: response.statusText }
        };
      }
      
      const errorMessage = errorData.error?.message || errorData.message || `API request failed: ${response.status} ${response.statusText}`;
      throw new ApiError(
        errorMessage,
        response.status,
        errorData.error?.code || errorData.code
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network error or other fetch error
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0,
      'NETWORK_ERROR'
    );
  }
}

export const configuratorApi = {
  /**
   * Create a new draft
   */
  async createSite(data: CreateSiteRequest): Promise<Site> {
    const response = await fetchApi<{ success: boolean; data: Site }>('/api/drafts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  /**
   * Get draft by ID
   */
  async getSite(siteId: string): Promise<Site> {
    const response = await fetchApi<{ success: boolean; data: Site }>(`/api/drafts/${siteId}`);
    return response.data;
  },

  /**
   * Update draft
   */
  async updateSite(siteId: string, data: Partial<CreateSiteRequest>): Promise<Site> {
    const response = await fetchApi<{ success: boolean; data: Site }>(`/api/drafts/${siteId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  /**
   * Get site preview URL
   */
  async getPreview(siteId: string): Promise<PreviewResponse> {
    // Preview returns HTML directly, so we construct the URL
    const baseUrl = API_BASE_URL || 'http://localhost:3001';
    return {
      url: `${baseUrl}/api/drafts/${siteId}/preview`,
      siteId,
    };
  },

  /**
   * Get site preview HTML
   *
   * Fetches the rendered HTML preview payload from the configurator service so it can
   * be rendered directly inside the Site Builder UI.
   */
  async getPreviewHtml(siteId: string): Promise<PreviewJson> {
    const response = await fetchApi<{ success: boolean; data: PreviewJson }>(
      `/api/drafts/${siteId}/preview`
    );
    return response.data;
  },

  /**
   * Migrate draft to permanent site after user registration
   */
  async migrateDraft(draftId: string, userId: string): Promise<{ success: boolean; data?: { siteId: string; draftId: string; migratedAt: string }; error?: { code: string; message: string } }> {
    const response = await fetchApi<{ success: boolean; data?: { siteId: string; draftId: string; migratedAt: string }; error?: { code: string; message: string } }>(
      `/api/drafts/${draftId}/migrate`,
      {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }
    );
    return response;
  },
};

