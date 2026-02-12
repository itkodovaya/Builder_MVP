'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const siteId = searchParams.get('siteId');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Регистрация успешна!</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ваш сайт успешно сохранен и готов к использованию.
          </p>
          {siteId && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              ID сайта: {siteId}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            На главную
          </button>
          <button
            onClick={() => router.back()}
            className="w-full px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Назад
          </button>
        </div>
      </div>
    </div>
  );
}

