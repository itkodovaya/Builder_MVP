/**
 * Wizard Validation Schemas
 * 
 * Zod schemas for wizard step validations
 */

import { z } from 'zod';

export const wizardStepSchema = z.object({
  stepNumber: z.number().int().min(1),
  stepType: z.enum(['brand-name', 'industry', 'logo', 'other']),
  data: z.record(z.unknown()),
});

export const brandNameStepSchema = z.object({
  stepNumber: z.literal(1),
  stepType: z.literal('brand-name'),
  data: z.object({
    brandName: z.string().min(1).max(100),
  }),
});

export const industryStepSchema = z.object({
  stepNumber: z.literal(2),
  stepType: z.literal('industry'),
  data: z.object({
    industry: z.string().min(1),
  }),
});

export const logoStepSchema = z.object({
  stepNumber: z.literal(3),
  stepType: z.literal('logo'),
  data: z.object({
    logo: z.object({
      filename: z.string(),
      mimeType: z.string(),
      size: z.number().max(5242880),
    }),
  }),
});

export type WizardStepInput = z.infer<typeof wizardStepSchema>;
export type BrandNameStepInput = z.infer<typeof brandNameStepSchema>;
export type IndustryStepInput = z.infer<typeof industryStepSchema>;
export type LogoStepInput = z.infer<typeof logoStepSchema>;

