/**
 * Draft Model
 * 
 * Represents a draft site configuration
 */

import type { Logo } from './logo.model';
import type { SiteConfig } from './site-config.model';
import type { WizardStep } from './wizard-step.model';

export interface Draft {
  id: string;
  brandName: string;
  industry: string;
  logo?: Logo;
  steps: WizardStep[];
  config?: SiteConfig;
  templateId?: string;
  frappePageName?: string; // Name of the Builder Page created in Frappe
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDraftData {
  brandName: string;
  industry: string;
  templateId?: string;
  logo?: {
    filename: string;
    mimeType: string;
    size: number;
  };
  steps?: WizardStep[];
}

export interface UpdateDraftData {
  brandName?: string;
  industry?: string;
  templateId?: string;
  logo?: {
    filename: string;
    mimeType: string;
    size: number;
  };
  steps?: WizardStep[];
}

