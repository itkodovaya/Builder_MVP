/**
 * Admin Service
 * 
 * Business logic for admin operations
 */

import { userService } from './user.service';
import { getStorageService } from './storage.service';
import { templateRegistry } from '../templates';
import { logger } from '../utils/logger.util';
import { validateEnv } from '../config/env.config';

const env = validateEnv();

class AdminService {
  /**
   * Get system statistics
   */
  async getStats(): Promise<{
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
  }> {
    try {
      // Get user stats
      const userStats = await userService.getUserStats();

      // Get draft stats
      const storage = await getStorageService();
      const allDrafts = await storage.getAllDrafts();

      // Get template stats
      const allTemplates = templateRegistry.getAllTemplates();

      // Try to get sites stats from external API
      let sitesStats;
      if (env.SITES_API_URL) {
        try {
          const response = await fetch(`${env.SITES_API_URL}/api/sites/stats`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(env.SITES_API_TOKEN ? { Authorization: `Bearer ${env.SITES_API_TOKEN}` } : {}),
            },
          });

          if (response.ok) {
            const data = await response.json();
            sitesStats = {
              total: data.data?.total || 0,
            };
          }
        } catch (error) {
          logger.warn('Failed to fetch sites stats from external API', error as Error);
        }
      }

      return {
        users: {
          total: userStats.total,
          admins: userStats.admins,
          regular: userStats.users,
        },
        drafts: {
          total: allDrafts.length,
        },
        templates: {
          total: allTemplates.length,
        },
        ...(sitesStats && { sites: sitesStats }),
      };
    } catch (error) {
      logger.error('Error getting admin stats:', error as Error);
      throw error;
    }
  }

  /**
   * Get all sites from external API
   */
  async getAllSites(): Promise<any[]> {
    if (!env.SITES_API_URL) {
      logger.warn('SITES_API_URL not configured, returning empty sites list');
      return [];
    }

    try {
      const response = await fetch(`${env.SITES_API_URL}/api/sites`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(env.SITES_API_TOKEN ? { Authorization: `Bearer ${env.SITES_API_TOKEN}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sites: ${response.status}`);
      }

      const result = await response.json();
      return result.data || result.sites || [];
    } catch (error) {
      logger.error('Error fetching sites from external API:', error as Error);
      throw error;
    }
  }

  /**
   * Get site by ID from external API
   */
  async getSite(siteId: string): Promise<any> {
    if (!env.SITES_API_URL) {
      throw new Error('SITES_API_URL not configured');
    }

    try {
      const response = await fetch(`${env.SITES_API_URL}/api/sites/${siteId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(env.SITES_API_TOKEN ? { Authorization: `Bearer ${env.SITES_API_TOKEN}` } : {}),
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Site not found');
        }
        throw new Error(`Failed to fetch site: ${response.status}`);
      }

      const result = await response.json();
      return result.data || result.site;
    } catch (error) {
      logger.error(`Error fetching site ${siteId}:`, error as Error);
      throw error;
    }
  }

  /**
   * Delete site from external API
   */
  async deleteSite(siteId: string): Promise<boolean> {
    if (!env.SITES_API_URL) {
      throw new Error('SITES_API_URL not configured');
    }

    try {
      const response = await fetch(`${env.SITES_API_URL}/api/sites/${siteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(env.SITES_API_TOKEN ? { Authorization: `Bearer ${env.SITES_API_TOKEN}` } : {}),
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Site not found');
        }
        throw new Error(`Failed to delete site: ${response.status}`);
      }

      return true;
    } catch (error) {
      logger.error(`Error deleting site ${siteId}:`, error as Error);
      throw error;
    }
  }
}

export const adminService = new AdminService();

