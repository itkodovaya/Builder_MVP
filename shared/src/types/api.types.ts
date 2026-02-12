/**
 * API Types
 * 
 * Types for API requests and responses
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiRequest {
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
}

