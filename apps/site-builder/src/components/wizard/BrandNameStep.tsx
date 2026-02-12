/**
 * Brand Name Step Component
 * 
 * Step 1: Brand name input
 */

'use client';

import { useState } from 'react';
import { WizardStep } from './WizardStep';

interface BrandNameStepProps {
  initialValue?: string;
  onSubmit: (brandName: string) => void;
  onNext: () => void;
}

export function BrandNameStep({ initialValue = '', onSubmit, onNext }: BrandNameStepProps) {
  const [brandName, setBrandName] = useState(initialValue);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brandName.trim()) {
      setError('Название бренда обязательно');
      return;
    }

    if (brandName.length > 100) {
      setError('Название бренда не должно превышать 100 символов');
      return;
    }

    setError('');
    onSubmit(brandName.trim());
    onNext();
  };

  return (
    <WizardStep
      title="Название вашего бренда"
      description="Введите название вашего бренда или компании"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Название бренда
          </label>
          <input
            type="text"
            placeholder="Например: Моя Компания"
            value={brandName}
            onChange={(e) => {
              setBrandName(e.target.value);
              setError('');
            }}
            required
            maxLength={100}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
          />
          {error && (
            <p className="mt-1 text-sm text-red-500">{error}</p>
          )}
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Продолжить
          </button>
        </div>
      </form>
    </WizardStep>
  );
}

