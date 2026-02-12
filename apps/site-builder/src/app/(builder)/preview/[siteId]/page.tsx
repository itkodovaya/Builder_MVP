'use client';

import { SitePreview } from '@/components/preview/SitePreview';
import { use } from 'react';
import { configuratorApi } from '@/lib/api/configurator';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';

export default function PreviewPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = use(params);
  const router = useRouter();
  const [fullHtml, setFullHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        setLoading(true);
        setError(null);

        // Получаем URL превью (на будущее, например для открытия в новой вкладке)
        await configuratorApi.getPreview(siteId);

        // Загружаем JSON превью. Бэкенд уже отдаёт полный HTML-документ,
        // поэтому мы просто кладём его в iframe srcDoc без дополнительной сборки.
        const previewPayload = await configuratorApi.getPreviewHtml(siteId);
        console.log('Preview payload loaded:', {
          htmlLength: previewPayload.html.length,
        });

        setFullHtml(previewPayload.html);

        setLoading(false);
      } catch (error) {
        console.error('Failed to load preview:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить preview. Проверьте, что backend сервис запущен.'
        );
        setLoading(false);
      }
    };

    if (siteId) {
      loadPreview();
    }
  }, [siteId]);

  const handleContinue = () => {
    router.push(routes.register(siteId));
  };

  return (
    <SitePreview
      siteId={siteId}
      fullHtml={fullHtml ?? undefined}
      loading={loading}
      error={error ?? undefined}
      onContinue={handleContinue}
    />
  );
}

