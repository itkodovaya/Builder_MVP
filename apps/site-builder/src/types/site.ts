/**
 * Site Types
 * 
 * TypeScript types for site-related data structures
 */

export interface Site {
  id: string;
  brandName: string;
  industry: string;
  logo?: Logo;
  config: SiteConfig;
  isTemporary: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Logo {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  uploadedAt: Date;
}

export interface SiteConfig {
  [key: string]: unknown;
}

export interface WizardStepData {
  stepNumber: number;
  brandName?: string;
  industry?: string;
  templateId?: string;
  logo?: File | null;
}

export interface WizardState {
  currentStep: number;
  siteId?: string;
  data: WizardStepData;
}

