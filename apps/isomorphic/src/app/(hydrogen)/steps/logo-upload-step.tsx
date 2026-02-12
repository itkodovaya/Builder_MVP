'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Text } from 'rizzui';
import { PiX } from 'react-icons/pi';
import { useAtom } from 'jotai';
import FormSummary from '../wizard/form-summary';
import { useBrandCreationStepper, siteDataAtom } from '../wizard';
import WizardFooter from '../wizard/footer';
import Upload from '@core/ui/upload';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';

export default function LogoUploadStep() {
  const { step } = useBrandCreationStepper();
  const [siteData, setSiteData] = useAtom(siteDataAtom);
  const [logo, setLogo] = useState<File | null>(siteData.logo);
  const [logoPreview, setLogoPreview] = useState<string | null>(siteData.logoPreview);
  const [isCreating, setIsCreating] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { handleSubmit } = useForm();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setLogo(file);
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
      setSiteData({ ...siteData, logo: file, logoPreview: preview });
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoPreview(null);
    setSiteData({ ...siteData, logo: null, logoPreview: null });
    if (imageRef.current) {
      imageRef.current.value = '';
    }
  };

  const handleCreateSite = async () => {
    setIsCreating(true);
    
    try {
      // Подготавливаем данные для отправки
      const siteDataToSave = {
        brandName: siteData.brandName,
        businessArea: siteData.businessArea,
        logo: logo ? {
          name: logo.name,
          type: logo.type,
          size: logo.size,
        } : null,
        logoPreview: logoPreview,
      };

      // Отправляем данные на сервер
      let response;
      try {
        response = await fetch('/api/site/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(siteDataToSave),
        });
      } catch (fetchError) {
        // Обрабатываем ошибки сети
        setIsCreating(false);
        const errorMsg = fetchError instanceof Error ? fetchError.message : 'Unknown network error';
        if (process.env.NODE_ENV === 'development') {
          console.error('Network error:', fetchError);
        }
        
        // Проверяем тип ошибки
        if (errorMsg.includes('ERR_INTERNET_DISCONNECTED') || errorMsg.includes('Failed to fetch')) {
          throw new Error('Не удалось подключиться к серверу. Убедитесь, что Next.js сервер запущен на http://localhost:3000');
        }
        throw new Error(`Ошибка сети: ${errorMsg}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (e) {
        // Если ответ не JSON, читаем как текст
        const text = await response.text();
        if (process.env.NODE_ENV === 'development') {
          console.error('Site creation error - non-JSON response:', text);
        }
        throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        const errorMessage = result?.error || result?.details || result?.message || 'Failed to create site';
        if (process.env.NODE_ENV === 'development') {
          console.error('Site creation error:', { status: response.status, result });
        }
        throw new Error(errorMessage);
      }

      // Получаем ID страницы из Frappe
      const frappePageName = result.frappePage?.page_name || result.site.frappePageName || result.site.id;
      
      // Сохраняем данные сайта в localStorage для временного хранения
      localStorage.setItem('tempSiteData', JSON.stringify({
        ...siteDataToSave,
        siteId: result.site.id,
        frappePageName: frappePageName,
        isTemporary: result.site.isTemporary,
        createdAt: result.site.createdAt,
      }));

      // Редиректим на страницу превью созданного сайта
      router.push(routes.sitePreview(frappePageName));
    } catch (error) {
      setIsCreating(false);
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating site:', error);
      }
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Ошибка при создании сайта. Пожалуйста, попробуйте еще раз.';
      alert(errorMessage);
    }
  };

  const onSubmit = () => {
    handleCreateSite();
  };

  return (
    <>
      <div className="col-span-full flex flex-col justify-center @5xl:col-span-5">
        <FormSummary
          className="@7xl:me-10"
          title="Загрузите логотип"
          description="Загрузите логотип вашего бренда. Это необязательно - вы можете пропустить этот шаг и загрузить логотип позже."
        />
      </div>

      <div className="col-span-full flex items-center justify-center @5xl:col-span-7">
        <form
          id={`rhf-${step.toString()}`}
          onSubmit={handleSubmit(onSubmit)}
          className="flex-grow rounded-lg bg-white p-5 @4xl:p-7 dark:bg-gray-0"
        >
          {!logoPreview ? (
            <Upload
              ref={imageRef}
              accept="img"
              onChange={handleFileChange}
              className="mb-6 min-h-[280px] justify-center border-dashed bg-gray-50 dark:bg-transparent"
              placeholderText={
                <div className="text-center">
                  <Text className="text-sm text-gray-500">
                    Перетащите изображение сюда или нажмите для выбора
                  </Text>
                  <Text className="mt-2 text-xs text-gray-400">
                    PNG, JPG, SVG до 5MB
                  </Text>
                </div>
              }
            />
          ) : (
            <div className="relative">
              <figure className="group relative mx-auto aspect-square w-48 overflow-hidden rounded-lg border border-gray-300 @md:w-64">
                <Image
                  src={logoPreview}
                  alt="Logo preview"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 768px) 100vw, 256px"
                />
                <button
                  onClick={handleRemoveLogo}
                  className="bg-red-lighter invisible absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full text-white opacity-0 transition duration-300 group-hover:visible group-hover:opacity-100"
                >
                  <PiX className="h-5 w-5" />
                </button>
              </figure>
            </div>
          )}
        </form>
      </div>
      <WizardFooter onNext={handleCreateSite} isLoading={isCreating} disabled={isCreating} />
    </>
  );
}

