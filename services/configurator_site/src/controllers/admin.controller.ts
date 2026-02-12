/**
 * Admin Controller
 * 
 * Handles admin endpoints for managing users, sites, templates, drafts
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { userService } from '../services/user.service';
import { adminService } from '../services/admin.service';
import { templateService } from '../services/template.service';
import { getStorageService } from '../services/storage.service';
import { logger } from '../utils/logger.util';
import type { UserRole } from '../models/user.model';

interface GetUserParams {
  Params: { id: string };
}

interface UpdateUserParams {
  Params: { id: string };
  Body: {
    email?: string;
    password?: string;
    role?: UserRole;
  };
}

interface DeleteUserParams {
  Params: { id: string };
}

interface GetSiteParams {
  Params: { id: string };
}

interface DeleteSiteParams {
  Params: { id: string };
}

interface GetDraftParams {
  Params: { id: string };
}

interface DeleteDraftParams {
  Params: { id: string };
}

export class AdminController {
  /**
   * Get all users
   */
  async getAllUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await userService.getAllUsers();
      
      // Remove password from response
      const usersWithoutPassword = users.map(({ password, ...user }) => user);

      return reply.send({
        success: true,
        data: usersWithoutPassword,
      });
    } catch (error) {
      logger.error('Error getting all users:', error as Error);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get users',
        },
      });
    }
  }

  /**
   * Get user by ID
   */
  async getUser(request: FastifyRequest<GetUserParams>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const user = await userService.findById(id);

      if (!user) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
          },
        });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return reply.send({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error) {
      logger.error('Error getting user:', error as Error);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get user',
        },
      });
    }
  }

  /**
   * Update user
   */
  async updateUser(request: FastifyRequest<UpdateUserParams>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const { email, password, role } = request.body;

      const updateData: any = {};
      if (email !== undefined) updateData.email = email;
      if (password !== undefined) updateData.password = password;
      if (role !== undefined) updateData.role = role;

      const user = await userService.updateUser(id, updateData);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return reply.send({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error) {
      logger.error('Error updating user:', error as Error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      
      if (errorMessage.includes('not found')) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: errorMessage,
          },
        });
      }

      return reply.code(400).send({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: errorMessage,
        },
      });
    }
  }

  /**
   * Delete user
   */
  async deleteUser(request: FastifyRequest<DeleteUserParams>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      await userService.deleteUser(id);

      return reply.send({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting user:', error as Error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      
      if (errorMessage.includes('not found')) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: errorMessage,
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: errorMessage,
        },
      });
    }
  }

  /**
   * Get all sites
   */
  async getAllSites(request: FastifyRequest, reply: FastifyReply) {
    try {
      const sites = await adminService.getAllSites();

      return reply.send({
        success: true,
        data: sites,
      });
    } catch (error) {
      logger.error('Error getting all sites:', error as Error);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get sites',
        },
      });
    }
  }

  /**
   * Get site by ID
   */
  async getSite(request: FastifyRequest<GetSiteParams>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const site = await adminService.getSite(id);

      return reply.send({
        success: true,
        data: site,
      });
    } catch (error) {
      logger.error('Error getting site:', error as Error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get site';
      
      if (errorMessage.includes('not found')) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: errorMessage,
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: errorMessage,
        },
      });
    }
  }

  /**
   * Delete site
   */
  async deleteSite(request: FastifyRequest<DeleteSiteParams>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      await adminService.deleteSite(id);

      return reply.send({
        success: true,
        message: 'Site deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting site:', error as Error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete site';
      
      if (errorMessage.includes('not found')) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: errorMessage,
          },
        });
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: errorMessage,
        },
      });
    }
  }

  /**
   * Get all templates
   */
  async getAllTemplates(request: FastifyRequest, reply: FastifyReply) {
    try {
      const templates = templateService.getAllTemplates();
      const templatesInfo = templates.map((template) => templateService.getTemplateInfo(template));

      return reply.send({
        success: true,
        data: templatesInfo,
      });
    } catch (error) {
      logger.error('Error getting all templates:', error as Error);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get templates',
        },
      });
    }
  }

  /**
   * Get all drafts
   */
  async getAllDrafts(request: FastifyRequest, reply: FastifyReply) {
    try {
      const storage = await getStorageService();
      const drafts = await storage.getAllDrafts();

      // Remove sensitive data and format for response
      const draftsInfo = drafts.map((draft) => ({
        id: draft.id,
        brandName: draft.brandName,
        industry: draft.industry,
        hasLogo: !!draft.logo,
        hasConfig: !!draft.config,
        expiresAt: draft.expiresAt?.toISOString(),
        createdAt: draft.createdAt.toISOString(),
        updatedAt: draft.updatedAt.toISOString(),
      }));

      return reply.send({
        success: true,
        data: draftsInfo,
      });
    } catch (error) {
      logger.error('Error getting all drafts:', error as Error);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get drafts',
        },
      });
    }
  }

  /**
   * Get draft by ID
   */
  async getDraft(request: FastifyRequest<GetDraftParams>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const storage = await getStorageService();
      const draft = await storage.getDraft(id);

      if (!draft) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Draft not found',
          },
        });
      }

      return reply.send({
        success: true,
        data: {
          id: draft.id,
          brandName: draft.brandName,
          industry: draft.industry,
          logo: draft.logo,
          config: draft.config,
          expiresAt: draft.expiresAt?.toISOString(),
          createdAt: draft.createdAt.toISOString(),
          updatedAt: draft.updatedAt.toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error getting draft:', error as Error);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get draft',
        },
      });
    }
  }

  /**
   * Delete draft
   */
  async deleteDraft(request: FastifyRequest<DeleteDraftParams>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const storage = await getStorageService();
      await storage.deleteDraft(id);

      return reply.send({
        success: true,
        message: 'Draft deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting draft:', error as Error);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete draft',
        },
      });
    }
  }

  /**
   * Get system statistics
   */
  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await adminService.getStats();

      return reply.send({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error getting stats:', error as Error);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get statistics',
        },
      });
    }
  }
}

export const adminController = new AdminController();

