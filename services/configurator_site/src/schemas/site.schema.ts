/**
 * Site Validation Schemas (Legacy)
 * 
 * @deprecated Use draft.schema.ts instead
 */

import { z } from 'zod';

export const createSiteSchema = z.object({
  brandName: z.string().min(1).max(100),
  industry: z.string().min(1),
  logo: z.object({
    filename: z.string(),
    mimeType: z.string(),
    size: z.number().max(5242880), // 5MB max
  }).optional(),
});

export const updateSiteSchema = z.object({
  brandName: z.string().min(1).max(100).optional(),
  industry: z.string().min(1).optional(),
  config: z.record(z.unknown()).optional(),
});

export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;

