/**
 * Draft Validation Schemas
 * 
 * Zod schemas for draft-related validations
 */

import { z } from 'zod';

export const createDraftSchema = z.object({
  brandName: z.string().min(1).max(100),
  industry: z.string().min(1),
  logo: z.object({
    filename: z.string(),
    mimeType: z.string(),
    size: z.number().max(5 * 1024 * 1024), // 5MB
  }).optional(),
  steps: z.array(z.object({
    stepNumber: z.number().int().min(1),
    stepType: z.enum(['brand-name', 'industry', 'logo', 'other']),
    data: z.record(z.unknown()),
    completed: z.boolean(),
  })).optional(),
});

export const updateDraftSchema = z.object({
  brandName: z.string().min(1).max(100).optional(),
  industry: z.string().min(1).optional(),
  logo: z.object({
    filename: z.string(),
    mimeType: z.string(),
    size: z.number().max(5 * 1024 * 1024),
  }).optional(),
  steps: z.array(z.object({
    stepNumber: z.number().int().min(1),
    stepType: z.enum(['brand-name', 'industry', 'logo', 'other']),
    data: z.record(z.unknown()),
    completed: z.boolean(),
  })).optional(),
});

export type CreateDraftInput = z.infer<typeof createDraftSchema>;
export type UpdateDraftInput = z.infer<typeof updateDraftSchema>;

