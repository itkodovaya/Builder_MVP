/**
 * Static Site Storage Service
 * 
 * Handles storage and retrieval of published static sites
 */

import { promises as fs } from 'fs';
import path from 'path';
import { validateEnv } from '../config/env.config';
import { logger } from '../utils/logger.util';
import type { StaticSiteFiles, AssetFile } from '../models/publish.model';
import { fileUploadService } from './file-upload.service';

const env = validateEnv();
const PUBLISH_DIR = env.PUBLISH_DIR || './published';

class StaticSiteStorage {
  private publishDir: string;

  constructor() {
    this.publishDir = path.resolve(PUBLISH_DIR);
    this.ensurePublishDir();
  }

  /**
   * Ensure publish directory exists
   */
  private async ensurePublishDir(): Promise<void> {
    try {
      await fs.access(this.publishDir);
    } catch {
      await fs.mkdir(this.publishDir, { recursive: true });
      logger.info(`Created publish directory: ${this.publishDir}`);
    }
  }

  /**
   * Save static site files
   */
  async saveSite(siteId: string, files: StaticSiteFiles): Promise<void> {
    const siteDir = path.join(this.publishDir, siteId);
    const assetsDir = path.join(siteDir, 'assets');

    // Create site directory
    await fs.mkdir(siteDir, { recursive: true });
    await fs.mkdir(assetsDir, { recursive: true });

    // Save HTML
    await fs.writeFile(
      path.join(siteDir, 'index.html'),
      files.html,
      'utf-8'
    );

    // Save CSS
    await fs.writeFile(
      path.join(siteDir, 'styles.css'),
      files.css,
      'utf-8'
    );

    // Copy assets if provided
    if (files.assets && files.assets.length > 0) {
      for (const asset of files.assets) {
        await this.copyAsset(asset, assetsDir);
      }
    }

    logger.info(`Published site ${siteId} to ${siteDir}`);
  }

  /**
   * Copy asset file
   */
  private async copyAsset(asset: AssetFile, targetDir: string): Promise<void> {
    try {
      const targetPath = path.join(targetDir, asset.filename);
      await fs.copyFile(asset.sourcePath, targetPath);
      logger.debug(`Copied asset ${asset.filename} to ${targetPath}`);
    } catch (error) {
      logger.warn(`Failed to copy asset ${asset.filename}:`, error as Error);
      // Don't throw - asset copy failure shouldn't block publishing
    }
  }

  /**
   * Get site HTML
   */
  async getSiteHTML(siteId: string): Promise<string> {
    const htmlPath = path.join(this.publishDir, siteId, 'index.html');
    try {
      return await fs.readFile(htmlPath, 'utf-8');
    } catch (error) {
      throw new Error(`Site ${siteId} not found or not published`);
    }
  }

  /**
   * Get site CSS
   */
  async getSiteCSS(siteId: string): Promise<string> {
    const cssPath = path.join(this.publishDir, siteId, 'styles.css');
    try {
      return await fs.readFile(cssPath, 'utf-8');
    } catch (error) {
      throw new Error(`CSS for site ${siteId} not found`);
    }
  }

  /**
   * Get asset file
   */
  async getAsset(siteId: string, assetPath: string): Promise<Buffer> {
    const fullPath = path.join(this.publishDir, siteId, 'assets', assetPath);
    
    // Security: prevent directory traversal
    const resolvedPath = path.resolve(fullPath);
    const resolvedPublishDir = path.resolve(this.publishDir);
    
    if (!resolvedPath.startsWith(resolvedPublishDir)) {
      throw new Error('Invalid asset path');
    }

    try {
      return await fs.readFile(fullPath);
    } catch (error) {
      throw new Error(`Asset ${assetPath} not found for site ${siteId}`);
    }
  }

  /**
   * Check if site is published
   */
  async isSitePublished(siteId: string): Promise<boolean> {
    const htmlPath = path.join(this.publishDir, siteId, 'index.html');
    try {
      await fs.access(htmlPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete published site
   */
  async deleteSite(siteId: string): Promise<void> {
    const siteDir = path.join(this.publishDir, siteId);
    try {
      await fs.rm(siteDir, { recursive: true, force: true });
      logger.info(`Deleted published site ${siteId}`);
    } catch (error) {
      logger.warn(`Failed to delete site ${siteId}:`, error as Error);
      throw error;
    }
  }

  /**
   * Get publish directory path
   */
  getPublishDir(): string {
    return this.publishDir;
  }
}

export const staticSiteStorage = new StaticSiteStorage();

