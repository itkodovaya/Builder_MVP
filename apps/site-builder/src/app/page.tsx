'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { routes } from '@/config/routes';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Проверяем, авторизован ли пользователь
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Если авторизован, перенаправляем на дашборд
      router.push(routes.dashboard);
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="absolute top-4 right-4">
        <Link
          href={routes.login}
          className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
        >
          Войти
        </Link>
      </div>
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">
          Создайте свой сайт за несколько минут
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Простой и быстрый конструктор сайтов для вашего бизнеса
        </p>
        <Link 
          href={routes.wizard.step1}
          className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Начать создание
        </Link>
      </div>
    </div>
  );
}

