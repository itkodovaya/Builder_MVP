'use client';

import { useEffect, useState } from 'react';
import { getFrappeBuilderUrl } from '@/lib/frappe-auth';
import { env } from '@/env.mjs';
import { Button } from 'rizzui';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';

interface FrappeBuilderIframeProps {
  userEmail: string;
}

export default function FrappeBuilderIframe({ userEmail }: FrappeBuilderIframeProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Создаем сессию Frappe
    const createSession = async () => {
      try {
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find((cookie) => 
          cookie.trim().startsWith('next-auth.session-token') || 
          cookie.trim().startsWith('__Secure-next-auth.session-token')
        );
        
        if (tokenCookie && userEmail) {
          const token = tokenCookie.split('=')[1];
          const frappeApiUrl = env.NEXT_PUBLIC_FRAPPE_API_URL || 'http://localhost:8000';
          
          try {
            const response = await fetch(`${frappeApiUrl}/api/method/builder.api.create_session_from_token`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: userEmail,
                token: token,
              }),
              credentials: 'include',
            });

            if (!response.ok && process.env.NODE_ENV === 'development') {
              console.warn('Failed to create Frappe session, but continuing anyway');
            }
          } catch (error) {
            // Игнорируем ошибки создания сессии, конструктор может работать и без неё
            if (process.env.NODE_ENV === 'development') {
              console.warn('Failed to create Frappe session:', error);
            }
          }
        }
        
        // Устанавливаем небольшую задержку перед показом конструктора
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error in createSession:', error);
        }
        setIsLoading(false);
      }
    };

    createSession();
  }, [userEmail]);

  const builderUrl = getFrappeBuilderUrl();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-sm text-gray-600">Подготовка конструктора...</p>
        </div>
      </div>
    );
  }

  // Используем объект для встраивания вместо iframe
  return (
    <div className="h-screen w-full">
      <object
        data={builderUrl}
        type="text/html"
        className="h-full w-full border-0"
        aria-label="Frappe Builder"
      >
        <div className="flex h-full w-full items-center justify-center bg-gray-50">
          <div className="mx-auto max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
            <div className="mb-4 text-6xl">⚠️</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Не удалось загрузить конструктор
            </h2>
            <p className="mb-6 text-sm text-gray-600">
              Попробуйте открыть конструктор в новой вкладке
            </p>
            <Button
              onClick={() => window.open(builderUrl, '_blank')}
              className="w-full"
            >
              Открыть в новой вкладке
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(routes.dashboard)}
              className="mt-2 w-full"
            >
              Вернуться в Dashboard
            </Button>
          </div>
        </div>
      </object>
    </div>
  );
}
