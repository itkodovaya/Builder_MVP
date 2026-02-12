/**
 * Admin API Client
 * 
 * API client for admin endpoints
 */

import { env } from '@/config/env';

const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface AdminSite {
  id: string;
  userId: string;
  brandName: string;
  industry: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTemplate {
  id: string;
  name: string;
  industry: string | string[];
  version: number;
}

export interface AdminDraft {
  id: string;
  brandName: string;
  industry: string;
  hasLogo: boolean;
  hasConfig: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  users: {
    total: number;
    admins: number;
    regular: number;
  };
  drafts: {
    total: number;
  };
  templates: {
    total: number;
  };
  sites?: {
    total: number;
  };
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

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (!token) {
    throw new ApiError('Authentication required', 401, 'UNAUTHORIZED');
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      let errorData: any;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }
      } else {
        const textError = await response.text();
        errorData = { message: textError || response.statusText };
      }

      const errorMessage = errorData.error?.message || errorData.message || `API request failed: ${response.status}`;
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
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0,
      'NETWORK_ERROR'
    );
  }
}

export const adminApi = {
  // Users
  async getAllUsers(): Promise<{ success: boolean; data: AdminUser[] }> {
    return fetchApi('/api/admin/users');
  },

  async getUser(userId: string): Promise<{ success: boolean; data: AdminUser }> {
    return fetchApi(`/api/admin/users/${userId}`);
  },

  async updateUser(userId: string, data: { email?: string; password?: string; role?: 'admin' | 'user' }): Promise<{ success: boolean; data: AdminUser }> {
    return fetchApi(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    return fetchApi(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Sites
  async getAllSites(): Promise<{ success: boolean; data: AdminSite[] }> {
    return fetchApi('/api/admin/sites');
  },

  async getSite(siteId: string): Promise<{ success: boolean; data: AdminSite }> {
    return fetchApi(`/api/admin/sites/${siteId}`);
  },

  async deleteSite(siteId: string): Promise<{ success: boolean; message: string }> {
    return fetchApi(`/api/admin/sites/${siteId}`, {
      method: 'DELETE',
    });
  },

  // Templates
  async getAllTemplates(): Promise<{ success: boolean; data: AdminTemplate[] }> {
    return fetchApi('/api/admin/templates');
  },

  // Drafts
  async getAllDrafts(): Promise<{ success: boolean; data: AdminDraft[] }> {
    return fetchApi('/api/admin/drafts');
  },

  async getDraft(draftId: string): Promise<{ success: boolean; data: AdminDraft }> {
    return fetchApi(`/api/admin/drafts/${draftId}`);
  },

  async deleteDraft(draftId: string): Promise<{ success: boolean; message: string }> {
    return fetchApi(`/api/admin/drafts/${draftId}`, {
      method: 'DELETE',
    });
  },

  // Statistics
  async getStats(): Promise<{ success: boolean; data: AdminStats }> {
    return fetchApi('/api/admin/stats');
  },
};

