'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from 'rizzui';
import { Title, Text } from 'rizzui/typography';
import { PiCheckCircleBold, PiSpinnerBold } from 'react-icons/pi';
import { routes } from '@/config/routes';

export default function SignInStep() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [frappeSessionCreated, setFrappeSessionCreated] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Проверяем, есть ли сессия NextAuth
    if (status === 'authenticated' && session) {
      // Проверяем, создана ли сессия Frappe
      if (session.frappeSession) {
        setFrappeSessionCreated(true);
        // Ждем немного, чтобы пользователь увидел успешное сообщение
        const timer = setTimeout(() => {
          setRedirecting(true);
          router.push(routes.dashboard || '/');
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        // Сессия Frappe еще не создана, ждем
        // Она должна создаться автоматически через jwt callback
        const checkTimer = setInterval(() => {
          if (session.frappeSession) {
            setFrappeSessionCreated(true);
            clearInterval(checkTimer);
            const redirectTimer = setTimeout(() => {
              setRedirecting(true);
              router.push(routes.dashboard || '/');
            }, 1500);
            return () => clearTimeout(redirectTimer);
          }
        }, 500);
        
        // Таймаут на случай, если сессия не создастся
        const timeout = setTimeout(() => {
          clearInterval(checkTimer);
          // Все равно редиректим, сессия Frappe создастся при доступе к Builder
          setFrappeSessionCreated(true);
          setTimeout(() => {
            setRedirecting(true);
            router.push(routes.dashboard || '/');
          }, 1000);
        }, 5000);
        
        return () => {
          clearInterval(checkTimer);
          clearTimeout(timeout);
        };
      }
    } else if (status === 'unauthenticated') {
      // Если нет сессии, редиректим на страницу входа
      router.push(routes.signIn);
    }
  }, [session, status, router]);

  return (
    <>
      <div className="col-span-full flex flex-col items-center justify-center @4xl:col-span-12">
        <div className="w-full max-w-md text-center">
          <div className="mb-6">
            <div className="mb-2 text-sm text-gray-500">Шаг 3 из 3</div>
            <Title
              as="h2"
              className="mb-3 text-2xl font-bold md:text-3xl xl:text-4xl"
            >
              {redirecting ? 'Перенаправление...' : 'Почти готово!'}
            </Title>
            <Text className="mt-3 text-sm leading-relaxed text-gray-500 md:text-base">
              {redirecting
                ? 'Вы будете перенаправлены в панель управления'
                : 'Создаем вашу сессию и настраиваем доступ к Builder'}
            </Text>
          </div>

          <div className="my-8 flex flex-col items-center gap-4">
            {status === 'loading' ? (
              <>
                <PiSpinnerBold className="h-16 w-16 animate-spin text-blue" />
                <Text className="text-sm text-gray-500">Проверка авторизации...</Text>
              </>
            ) : status === 'authenticated' ? (
              <>
                {frappeSessionCreated ? (
                  <>
                    <PiCheckCircleBold className="h-16 w-16 text-green-500" />
                    <Text className="text-sm font-medium text-gray-700">
                      Сессия успешно создана!
                    </Text>
                    {redirecting && (
                      <div className="mt-4">
                        <PiSpinnerBold className="h-8 w-8 animate-spin text-blue mx-auto" />
                        <Text className="mt-2 text-xs text-gray-500">
                          Перенаправление в панель...
                        </Text>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <PiSpinnerBold className="h-16 w-16 animate-spin text-blue" />
                    <Text className="text-sm text-gray-500">
                      Создание сессии Frappe...
                    </Text>
                  </>
                )}
              </>
            ) : (
              <>
                <Text className="text-sm text-red-500">
                  Ошибка авторизации. Перенаправление на страницу входа...
                </Text>
              </>
            )}
          </div>

          {!redirecting && status === 'authenticated' && (
            <div className="mt-8">
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push(routes.dashboard || '/')}
              >
                Перейти в панель сейчас
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

