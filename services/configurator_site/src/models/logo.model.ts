/**
 * Logo Model
 * 
 * Represents a logo file upload
 */

export interface Logo {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  uploadedAt: Date;
}

