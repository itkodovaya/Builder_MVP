/**
 * User Model
 * 
 * Shared user model (to be used when auth service is added)
 */

import type { BaseEntity } from '../types';

export interface User extends BaseEntity {
  email: string;
  name?: string;
  // Additional user fields will be added when auth service is implemented
}

