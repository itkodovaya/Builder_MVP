/**
 * Industry Step Component
 * 
 * Step 2: Industry selection
 */

'use client';

import { useState } from 'react';
import { WizardStep } from './WizardStep';

interface IndustryStepProps {
  initialValue?: string;
  onSubmit: (industry: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const INDUSTRIES = [
  { value: 'tech', label: 'Технологии' },
  { value: 'retail', label: 'Розничная торговля' },
  { value: 'education', label: 'Образование' },
  { value: 'healthcare', label: 'Здравоохранение' },
  { value: 'finance', label: 'Финансы' },
  { value: 'real-estate', label: 'Недвижимость' },
  { value: 'restaurant', label: 'Рестораны и кафе' },
  { value: 'beauty', label: 'Красота и здоровье' },
  { value: 'sports', label: 'Спорт и фитнес' },
  { value: 'art', label: 'Искусство и дизайн' },
  { value: 'consulting', label: 'Консалтинг' },
  { value: 'other', label: 'Другое' },
];

export function IndustryStep({ initialValue = '', onSubmit, onNext, onBack }: IndustryStepProps) {
  const [industry, setIndustry] = useState(initialValue);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!industry) {
      setError('Выберите сферу деятельности');
      return;
    }

    setError('');
    onSubmit(industry);
    onNext();
  };

  return (
    <WizardStep
      title="Сфера деятельности"
      description="Выберите сферу деятельности вашего бизнеса"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Сфера деятельности
          </label>
          <select
            value={industry}
            onChange={(e) => {
              setIndustry(e.target.value);
              setError('');
            }}
            required
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
          >
            <option value="">Выберите сферу</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind.value} value={ind.value}>
                {ind.label}
              </option>
            ))}
          </select>
          {error && (
            <p className="mt-1 text-sm text-red-500">{error}</p>
          )}
        </div>
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Назад
          </button>
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

