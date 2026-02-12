/**
 * Site Model
 * 
 * Shared site model used across services
 */

import type { BaseEntity } from '../types';

export interface Site extends BaseEntity {
  userId?: string; // null for temporary sites
  brandName: string;
  industry: string;
  config: Record<string, unknown>;
  isTemporary: boolean;
  expiresAt?: Date;
}

