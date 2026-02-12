'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { routes } from '@/config/routes';
import toast from 'react-hot-toast';
import RoleBasedLayout from '@/layouts/role-based-layout';

interface Site {
  id: string;
  brandName: string;
  industry: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем, авторизован ли пользователь
    const token = localStorage.getItem('auth_token');
    const email = localStorage.getItem('user_email');
    const userId = localStorage.getItem('user_id');

    if (!token || !email || !userId) {
      // Если не авторизован, перенаправляем на страницу входа
      router.push(routes.login);
      return;
    }

    setUserEmail(email);
    loadSites();
  }, [router]);

  const loadSites = async () => {
    try {
      setLoading(true);
      // TODO: Заменить на реальный API для получения сайтов пользователя
      // const response = await configuratorApi.getUserSites(userId);
      // setSites(response.data);
      
      // Пока используем заглушку
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSites([]);
    } catch (error) {
      console.error('Error loading sites:', error);
      toast.error('Не удалось загрузить сайты');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <RoleBasedLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
          </div>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout>
      <div>
        {/* Main Content */}
        <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Мои сайты
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Управляйте своими сайтами и создавайте новые
          </p>
        </div>

        {sites.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                У вас пока нет сайтов
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Создайте свой первый сайт за несколько минут
              </p>
              <Link
                href={routes.wizard.step1}
                className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
              >
                Создать сайт
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site) => (
              <div
                key={site.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {site.brandName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {site.industry}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={routes.preview(site.id)}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-center font-medium hover:bg-primary-dark transition-colors"
                  >
                    Просмотр
                  </Link>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Настройки
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </RoleBasedLayout>
  );
}

