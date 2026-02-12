/**
 * Auth API Client
 * 
 * Client for user authentication and registration
 */

import { env } from '@/config/env';

const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

export interface RegisterRequest {
  email: string;
  password: string;
  siteId?: string;
}

export interface RegisterResponse {
  success: boolean;
  data?: {
    userId: string;
    email: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    userId: string;
    email: string;
    role?: 'admin' | 'user';
    token?: string;
  };
  error?: {
    code: string;
    message: string;
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
      let errorData: any = {};
      const contentType = response.headers.get('content-type');
      
      try {
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text();
          if (text) {
            errorData = JSON.parse(text);
          }
        } else {
          const text = await response.text();
          errorData = { 
            message: text || response.statusText,
            error: { message: text || response.statusText }
          };
        }
        console.error('API Error Response:', errorData);
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
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

export const authApi = {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await fetchApi<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetchApi<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },
};

