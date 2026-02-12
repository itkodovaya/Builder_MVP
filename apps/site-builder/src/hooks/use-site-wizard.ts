/**
 * Site Wizard Hook
 * 
 * Hook for managing site creation wizard state
 */

import { useState, useCallback, useEffect } from 'react';
import type { WizardState, WizardStepData } from '@/types/site';

const TOTAL_STEPS = 3;
const STORAGE_KEY = 'site-wizard-state';

// Load state from localStorage
function loadState(): WizardState | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load wizard state from localStorage:', error);
  }
  return null;
}

// Save state to localStorage
function saveState(state: WizardState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save wizard state to localStorage:', error);
  }
}

export function useSiteWizard() {
  const [state, setState] = useState<WizardState>(() => {
    const loaded = loadState();
    return loaded || {
      currentStep: 1,
      data: {
        stepNumber: 1,
      },
    };
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      setState((prev) => ({
        ...prev,
        currentStep: step,
        data: {
          ...prev.data,
          stepNumber: step,
        },
      }));
    }
  }, []);

  const nextStep = useCallback(() => {
    if (state.currentStep < TOTAL_STEPS) {
      goToStep(state.currentStep + 1);
    }
  }, [state.currentStep, goToStep]);

  const previousStep = useCallback(() => {
    if (state.currentStep > 1) {
      goToStep(state.currentStep - 1);
    }
  }, [state.currentStep, goToStep]);

  const updateStepData = useCallback((data: Partial<WizardStepData>) => {
    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        ...data,
      },
    }));
  }, []);

  const setSiteId = useCallback((siteId: string) => {
    setState((prev) => ({
      ...prev,
      siteId,
    }));
  }, []);

  const reset = useCallback(() => {
    const resetState = {
      currentStep: 1,
      data: {
        stepNumber: 1,
      },
    };
    setState(resetState);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    currentStep: state.currentStep,
    totalSteps: TOTAL_STEPS,
    siteId: state.siteId,
    data: state.data,
    goToStep,
    nextStep,
    previousStep,
    updateStepData,
    setSiteId,
    reset,
    isFirstStep: state.currentStep === 1,
    isLastStep: state.currentStep === TOTAL_STEPS,
  };
}

