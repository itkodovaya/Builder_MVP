/**
 * Admin Middleware
 * 
 * Middleware for checking admin role
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { userService } from '../services/user.service';
import { logger } from '../utils/logger.util';

/**
 * Extract user ID from token
 * For MVP, token format is: token_{userId}_{timestamp}
 */
function extractUserIdFromToken(token: string | undefined): string | null {
  if (!token) {
    return null;
  }

  // Remove "Bearer " prefix if present
  const cleanToken = token.replace(/^Bearer\s+/i, '');
  
  // Token format: token_{userId}_{timestamp}
  const parts = cleanToken.split('_');
  if (parts.length >= 2 && parts[0] === 'token') {
    return parts[1];
  }

  return null;
}

/**
 * Require admin role middleware
 */
export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.authorization;
    const userId = extractUserIdFromToken(authHeader);

    if (!userId) {
      return reply.code(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    // Get user from service
    const user = await userService.findById(userId);
    if (!user) {
      return reply.code(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found',
        },
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      logger.warn(`Non-admin user ${user.email} attempted to access admin endpoint`);
      return reply.code(403).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required',
        },
      });
    }

    // Attach user to request for use in controllers
    (request as any).user = user;
  } catch (error) {
    logger.error('Admin middleware error:', error as Error);
    return reply.code(500).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    });
  }
}

