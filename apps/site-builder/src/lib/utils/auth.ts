/**
 * Auth Utilities
 * 
 * Utility functions for authentication and authorization
 */

import { adminApi } from '@/lib/api/admin';

export type UserRole = 'admin' | 'user';

/**
 * Get current user role from localStorage or API
 */
export async function getUserRole(): Promise<UserRole | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  // Try to get from localStorage first (set during login)
  const storedRole = localStorage.getItem('user_role');
  if (storedRole === 'admin' || storedRole === 'user') {
    return storedRole;
  }

  // If not in localStorage, try to get from API
  try {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      return null;
    }

    const response = await adminApi.getUser(userId);
    if (response.success && response.data) {
      const role = response.data.role;
      localStorage.setItem('user_role', role);
      return role;
    }
  } catch (error) {
    console.error('Error getting user role:', error);
  }

  return null;
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin';
}

/**
 * Require admin role - redirects to login if not admin
 */
export async function requireAdmin(redirectTo?: string): Promise<boolean> {
  const admin = await isAdmin();
  if (!admin && typeof window !== 'undefined') {
    const redirectPath = redirectTo || '/login';
    window.location.href = redirectPath;
    return false;
  }
  return admin;
}

/**
 * Get user role synchronously from localStorage
 * Use this for UI checks, but verify with isAdmin() for security
 */
export function getUserRoleSync(): UserRole | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedRole = localStorage.getItem('user_role');
  if (storedRole === 'admin' || storedRole === 'user') {
    return storedRole;
  }

  return null;
}

/**
 * Check if current user is admin (synchronous, from localStorage)
 */
export function isAdminSync(): boolean {
  return getUserRoleSync() === 'admin';
}

