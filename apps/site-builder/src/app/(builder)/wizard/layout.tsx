'use client';

import { useSiteWizard } from '@/hooks/use-site-wizard';

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentStep, totalSteps } = useSiteWizard();

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen">
      <div className="bg-white dark:bg-gray-900 border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Шаг {currentStep} из {totalSteps}
            </h2>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

