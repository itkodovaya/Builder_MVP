'use client';

import { LogoUploadStep } from '@/components/wizard/LogoUploadStep';
import { useSiteWizard } from '@/hooks/use-site-wizard';
import { useRouter } from 'next/navigation';
import { configuratorApi } from '@/lib/api/configurator';
import { routes } from '@/config/routes';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Step3Page() {
  const router = useRouter();
  const { updateStepData, data, setSiteId, siteId: existingSiteId } = useSiteWizard();
  const [loading, setLoading] = useState(false);

  // Ensure we have a valid draft ID. If the stored one пропал из бэкенда
  // (например, после перезапуска сервера), создаём новый драфт.
  const ensureDraftId = async (): Promise<string> => {
    let siteId = existingSiteId;

    // Try to reuse existing draft if it still exists on backend
    if (siteId) {
      try {
        await configuratorApi.getSite(siteId);
        return siteId;
      } catch (error) {
        console.warn('Existing draft not found on backend, creating a new one.', error);
        siteId = undefined;
      }
    }

    // Validate required data before creating a new draft
    if (!data.brandName || !data.industry) {
      throw new Error(
        'Необходимо заполнить название бренда и сферу деятельности. Вернитесь на предыдущие шаги.'
      );
    }

    console.log('Creating site with data:', {
      brandName: data.brandName,
      industry: data.industry,
      templateId: 'modern', // Always use 'modern' as default
    });

    const draft = await configuratorApi.createSite({
      brandName: data.brandName,
      industry: data.industry,
      templateId: 'modern', // Always use 'modern' as default
    });

    console.log('Site created:', draft);
    setSiteId(draft.id);
    return draft.id;
  };

  const handleSubmit = async (file: File) => {
    setLoading(true);
    try {
      const siteId = await ensureDraftId();

      // Upload logo file
      const formData = new FormData();
      // Fastify multipart expects the field name to match what the controller expects
      // The controller uses request.file() which gets the first file, so any name works
      formData.append('logo', file);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const logoResponse = await fetch(
        `${apiUrl}/api/drafts/${siteId}/logo`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!logoResponse.ok) {
        const errorData = await logoResponse.json().catch(() => ({ message: 'Failed to upload logo' }));
        throw new Error(errorData.error?.message || errorData.message || 'Failed to upload logo');
      }

      updateStepData({ logo: file });
      toast.success('Логотип успешно загружен!');
      router.push(routes.preview(siteId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка при загрузке логотипа');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      const siteId = await ensureDraftId();

      toast.success('Сайт успешно создан!');
      router.push(routes.preview(siteId));
    } catch (error) {
      console.error('Error creating site:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Ошибка при создании сайта';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push(routes.wizard.step2);
  };

  return (
    <LogoUploadStep
      onSubmit={handleSubmit}
      onBack={handleBack}
      onSkip={handleSkip}
      isLoading={loading}
    />
  );
}
