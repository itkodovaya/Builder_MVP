/**
 * File Model
 * 
 * Shared file model for uploaded files
 */

import type { BaseEntity } from '../types';

export interface File extends BaseEntity {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  uploadedBy?: string; // userId if available
}

