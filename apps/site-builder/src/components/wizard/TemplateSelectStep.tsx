'use client';

import { clsx } from 'clsx';
import { WizardStep } from './WizardStep';

interface TemplateSelectStepProps {
  initialValue?: string;
  onSubmit: (templateId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const TEMPLATES = [
  {
    id: 'default',
    name: 'Классический',
    description: 'Простой, универсальный шаблон, подходящий для любого бизнеса.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    id: 'modern',
    name: 'Современный',
    description: 'Стильный дизайн с градиентами, карточками и современной типографикой.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export function TemplateSelectStep({
  initialValue = 'modern', // Default to modern
  onSubmit,
  onNext,
  onBack,
}: TemplateSelectStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const handleSelect = (templateId: string) => {
    onSubmit(templateId);
  };

  return (
    <WizardStep
      title="Выберите стиль сайта"
      description="Вы сможете изменить его в любой момент позже"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-1">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => handleSelect(tpl.id)}
              className={clsx(
                'relative flex items-start p-4 text-left border rounded-xl transition-all',
                initialValue === tpl.id
                  ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              )}
            >
              <div
                className={clsx(
                  'flex-shrink-0 p-2 rounded-lg mr-4',
                  initialValue === tpl.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                )}
              >
                {tpl.icon}
              </div>
              <div>
                <h3
                  className={clsx(
                    'font-semibold',
                    initialValue === tpl.id ? 'text-blue-900' : 'text-gray-900'
                  )}
                >
                  {tpl.name}
                </h3>
                <p
                  className={clsx(
                    'text-sm mt-1',
                    initialValue === tpl.id ? 'text-blue-700' : 'text-gray-500'
                  )}
                >
                  {tpl.description}
                </p>
              </div>
              {initialValue === tpl.id && (
                <div className="absolute top-4 right-4 text-blue-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Назад
          </button>
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition-colors"
          >
            Продолжить
          </button>
        </div>
      </form>
    </WizardStep>
  );
}
