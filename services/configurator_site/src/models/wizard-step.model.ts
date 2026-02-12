/**
 * Wizard Step Model
 * 
 * Represents a step in the site creation wizard
 */

export interface WizardStep {
  stepNumber: number;
  stepType: 'brand-name' | 'industry' | 'logo' | 'other';
  data: Record<string, unknown>;
  completed: boolean;
}

export interface WizardState {
  currentStep: number;
  steps: WizardStep[];
  siteId?: string;
}

