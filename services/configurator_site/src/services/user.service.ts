/**
 * User Service
 * 
 * Handles user registration and authentication
 */

import type { User, CreateUserData, UserRole } from '../models/user.model';
import { generateId } from '../utils/id.util';
import { logger } from '../utils/logger.util';

class UserService {
  private users: Map<string, User> = new Map();

  constructor() {
    const now = new Date();
    
    // Create default admin user
    const adminId = generateId();
    const adminUser: User = {
      id: adminId,
      email: 'admin@admin.com',
      password: 'admin',
      role: 'admin',
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(adminId, adminUser);
    logger.info(`Default admin user created: ${adminUser.email}`);

    // Create default test user (regular user)
    const testUserId = generateId();
    const testUser: User = {
      id: testUserId,
      email: 'test@example.com',
      password: 'test12345',
      role: 'user',
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(testUserId, testUser);
    logger.info(`Default test user created: ${testUser.email}`);
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserData): Promise<User> {
    // Check if user already exists
    const existingUser = Array.from(this.users.values()).find(
      (u) => u.email.toLowerCase() === data.email.toLowerCase()
    );

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const userId = generateId();
    const now = new Date();

    const user: User = {
      id: userId,
      email: data.email.toLowerCase(),
      password: data.password, // В продакшене должен быть хеш (bcrypt)
      role: data.role || 'user',
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(userId, user);
    logger.info(`User ${user.email} created with ID ${userId} and role ${user.role}`);

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | undefined> {
    const user = Array.from(this.users.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    return user;
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  /**
   * Authenticate user
   */
  async authenticate(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    
    if (!user) {
      return null;
    }

    // В продакшене нужно сравнивать хеши
    if (user.password !== password) {
      return null;
    }

    return user;
  }

  /**
   * Get all users (for debugging)
   */
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.role = role;
    user.updatedAt = new Date();
    this.users.set(userId, user);
    logger.info(`User ${user.email} role updated to ${role}`);

    return user;
  }

  /**
   * Update user
   */
  async updateUser(userId: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (data.email && data.email !== user.email) {
      const newEmail = data.email;
      const existingUser = Array.from(this.users.values()).find(
        (u) => u.id !== userId && u.email.toLowerCase() === newEmail.toLowerCase()
      );
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      user.email = newEmail.toLowerCase();
    }

    if (data.password) {
      user.password = data.password;
    }

    if (data.role) {
      user.role = data.role;
    }

    user.updatedAt = new Date();
    this.users.set(userId, user);
    logger.info(`User ${user.email} updated`);

    return user;
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    this.users.delete(userId);
    logger.info(`User ${user.email} deleted`);
    return true;
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    total: number;
    admins: number;
    users: number;
  }> {
    const allUsers = Array.from(this.users.values());
    return {
      total: allUsers.length,
      admins: allUsers.filter((u) => u.role === 'admin').length,
      users: allUsers.filter((u) => u.role === 'user').length,
    };
  }
}

export const userService = new UserService();

