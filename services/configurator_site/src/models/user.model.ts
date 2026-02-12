/**
 * User Model
 * 
 * User data structure for authentication
 */

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  password: string; // В продакшене должен быть хеш
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  role?: UserRole;
}

