/**
 * Migration Validation Schemas
 * 
 * Zod schemas for migration-related validations
 */

import { z } from 'zod';

export const migrateDraftSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export type MigrateDraftInput = z.infer<typeof migrateDraftSchema>;

