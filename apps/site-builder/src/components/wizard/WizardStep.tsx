/**
 * Wizard Step Component
 * 
 * Base component for wizard steps
 */

import { ReactNode } from 'react';

interface WizardStepProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function WizardStep({ children, title, description }: WizardStepProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl">
        {(title || description) && (
          <div className="mb-8 text-center">
            {title && (
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
            )}
            {description && (
              <p className="text-gray-600 dark:text-gray-400">{description}</p>
            )}
          </div>
        )}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

