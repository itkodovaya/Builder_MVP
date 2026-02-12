/**
 * Auth Controller
 * 
 * Handles authentication endpoints (register, login)
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { userService } from '../services/user.service';
import { logger } from '../utils/logger.util';

interface RegisterBody {
  email: string;
  password: string;
  siteId?: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export class AuthController {
  /**
   * Register a new user
   */
  async register(request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) {
    try {
      const { email, password } = request.body;

      if (!email || !password) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required',
          },
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email format',
          },
        });
      }

      // Validate password length
      if (password.length < 8) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Password must be at least 8 characters',
          },
        });
      }

      const user = await userService.createUser({ email, password });

      logger.info(`User registered: ${user.email} (${user.id})`);

      return reply.send({
        success: true,
        data: {
          userId: user.id,
          email: user.email,
        },
      });
    } catch (error) {
      logger.error('Registration error:', error as Error);
      
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      
      return reply.code(400).send({
        success: false,
        error: {
          code: 'REGISTRATION_ERROR',
          message: errorMessage,
        },
      });
    }
  }

  /**
   * Login user
   */
  async login(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
    try {
      const { email, password } = request.body;

      if (!email || !password) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required',
          },
        });
      }

      const user = await userService.authenticate(email, password);

      if (!user) {
        return reply.code(401).send({
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Invalid email or password',
          },
        });
      }

      logger.info(`User logged in: ${user.email} (${user.id})`);

      // В продакшене здесь должен быть JWT токен
      const token = `token_${user.id}_${Date.now()}`;

      return reply.send({
        success: true,
        data: {
          userId: user.id,
          email: user.email,
          role: user.role,
          token,
        },
      });
    } catch (error) {
      logger.error('Login error:', error as Error);
      
      return reply.code(500).send({
        success: false,
        error: {
          code: 'LOGIN_ERROR',
          message: 'Login failed',
        },
      });
    }
  }
}

export const authController = new AuthController();

