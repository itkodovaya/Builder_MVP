/**
 * Site Preview Component
 * 
 * Component for displaying site preview
 */

'use client';

import { useEffect, useState } from 'react';

interface SitePreviewProps {
  siteId: string;
  fullHtml?: string;
  loading?: boolean;
  error?: string;
  onContinue?: () => void;
}

export function SitePreview({
  siteId,
  fullHtml,
  loading: externalLoading,
  error: externalError,
  onContinue,
}: SitePreviewProps) {
  const [internalLoading, setInternalLoading] = useState(true);
  const [internalError, setInternalError] = useState<string | null>(null);

  const loading = externalLoading ?? internalLoading;
  const error = externalError ?? internalError;

  useEffect(() => {
    if (fullHtml) {
      setInternalLoading(false);
      setInternalError(null);
      return;
    }

    // Если HTML превью не пришёл за разумное время – покажем ошибку
    const timer = setTimeout(() => {
      if (!fullHtml && !externalError) {
        setInternalError('Preview не был загружен. Проверьте, что backend сервис запущен.');
        setInternalLoading(false);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [fullHtml, externalError]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-red-600">Ошибка загрузки preview</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Загрузка preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-100 dark:bg-gray-900">
      {fullHtml ? (
        <iframe
          title={`Site Preview ${siteId}`}
          className="w-full h-full border-0 bg-white dark:bg-gray-950"
          sandbox="allow-same-origin"
          srcDoc={fullHtml}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Preview будет доступен после создания сайта
            </p>
          </div>
        </div>
      )}
      {onContinue && (
        <button
          onClick={onContinue}
          className="fixed bottom-6 right-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg z-50"
        >
          Продолжить
        </button>
      )}
    </div>
  );
}

