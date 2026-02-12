'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from 'rizzui';
import { env } from '@/env.mjs';
import { routes } from '@/config/routes';
import { getFrappeBuilderUrl } from '@/lib/frappe-auth';

export default function SitePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.siteId as string;
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const frappeApiUrl = env.NEXT_PUBLIC_FRAPPE_API_URL || 'http://localhost:8000';
        
        // Получаем HTML превью страницы из Frappe
        // Используем API метод get_page_preview_html, который возвращает HTML
        const response = await fetch(
          `${frappeApiUrl}/api/method/builder.api.get_page_preview_html?page=${encodeURIComponent(siteId)}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'text/html',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load page preview');
        }

        // Метод возвращает Response с HTML содержимым
        const html = await response.text();
        setHtmlContent(html);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading preview:', err);
        }
        setError(err instanceof Error ? err.message : 'Failed to load preview');
      } finally {
        setIsLoading(false);
      }
    };

    if (siteId) {
      loadPreview();
    }
  }, [siteId]);

  const handleEditInBuilder = () => {
    // Открываем конструктор с этой страницей
    const builderUrl = getFrappeBuilderUrl(`/page/${siteId}`);
    window.open(builderUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-sm text-gray-600">Загрузка сайта...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="mx-auto max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
          <div className="mb-4 text-6xl">⚠️</div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Не удалось загрузить сайт
          </h2>
          <p className="mb-6 text-sm text-gray-600">{error}</p>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => router.push(routes.dashboard)}
              className="w-full"
            >
              Вернуться в Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Попробовать снова
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full">
      {/* Панель управления поверх превью */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <Button
          onClick={handleEditInBuilder}
          variant="outline"
          size="sm"
          className="bg-white shadow-md"
        >
          Редактировать в конструкторе
        </Button>
        <Button
          onClick={() => router.push(routes.dashboard)}
          variant="outline"
          size="sm"
          className="bg-white shadow-md"
        >
          Вернуться в Dashboard
        </Button>
      </div>

      {/* Превью сайта */}
      {htmlContent ? (
        <iframe
          title="Site Preview"
          className="h-full w-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          srcDoc={htmlContent}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-50">
          <p className="text-gray-600">Сайт не найден</p>
        </div>
      )}
    </div>
  );
}

