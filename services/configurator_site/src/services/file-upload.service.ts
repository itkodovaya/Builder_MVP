/**
 * File Upload Service
 * 
 * Handles file uploads (logos) and file management
 */

import { promises as fs } from 'fs';
import path from 'path';
import { generateId } from '../utils/id.util';
import { logger } from '../utils/logger.util';
import type { Logo } from '../models/logo.model';
import { validateEnv } from '../config/env.config';

const env = validateEnv();
const UPLOAD_DIR = env.UPLOAD_DIR || './uploads';

class FileUploadService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(UPLOAD_DIR);
    this.ensureUploadDir();
  }

  /**
   * Ensure upload directory exists
   */
  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Validate file
   */
  validateFile(file: {
    filename: string;
    mimeType: string;
    size: number;
  }): { valid: boolean; error?: string } {
    const MAX_SIZE = (env.MAX_FILE_SIZE || 5 * 1024 * 1024); // 5MB default
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];

    if (file.size > MAX_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${MAX_SIZE / 1024 / 1024}MB`,
      };
    }

    if (!ALLOWED_TYPES.includes(file.mimeType)) {
      return {
        valid: false,
        error: `File type ${file.mimeType} is not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`,
      };
    }

    return { valid: true };
  }

  /**
   * Save file from buffer
   */
  async saveFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    draftId: string
  ): Promise<Logo> {
    const fileId = generateId();
    const ext = path.extname(originalName);
    const filename = `${fileId}${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    await fs.writeFile(filepath, buffer);

    const logo: Logo = {
      id: fileId,
      filename,
      originalName,
      mimeType,
      size: buffer.length,
      path: filepath,
      url: `/uploads/${filename}`,
      uploadedAt: new Date(),
    };

    return logo;
  }

  /**
   * Get file URL
   */
  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  /**
   * Delete file
   */
  async deleteFile(filename: string): Promise<void> {
    const filepath = path.join(this.uploadDir, filename);
    try {
      await fs.unlink(filepath);
    } catch (error) {
      // File might not exist, ignore error
      logger.warn(`Failed to delete file ${filepath}:`, error as Error);
    }
  }

  /**
   * Get upload directory path
   */
  getUploadDir(): string {
    return this.uploadDir;
  }
}

export const fileUploadService = new FileUploadService();

