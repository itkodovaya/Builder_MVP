'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { routes } from '@/config/routes';
import { requireAdmin } from '@/lib/utils/auth';
import BerylliumLayout from '@/layouts/beryllium/beryllium-layout';
import { PiUsers, PiGlobe, PiFileText, PiFolderOpen, PiChartBar } from 'react-icons/pi';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const isAdmin = await requireAdmin();
      if (!isAdmin) {
        return;
      }
      setLoading(false);
    };

    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <BerylliumLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
          </div>
        </div>
      </BerylliumLayout>
    );
  }

  const adminSections = [
    {
      title: 'Пользователи',
      description: 'Управление пользователями системы',
      icon: PiUsers,
      href: routes.admin.users,
      color: 'bg-blue-500',
    },
    {
      title: 'Сайты',
      description: 'Управление всеми сайтами',
      icon: PiGlobe,
      href: routes.admin.sites,
      color: 'bg-green-500',
    },
    {
      title: 'Шаблоны',
      description: 'Управление шаблонами сайтов',
      icon: PiFileText,
      href: routes.admin.templates,
      color: 'bg-purple-500',
    },
    {
      title: 'Черновики',
      description: 'Просмотр и управление черновиками',
      icon: PiFolderOpen,
      href: routes.admin.drafts,
      color: 'bg-orange-500',
    },
    {
      title: 'Статистика',
      description: 'Общая статистика системы',
      icon: PiChartBar,
      href: routes.admin.stats,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <BerylliumLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Админ-панель
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Управление всеми аспектами системы
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.href}
                href={section.href}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`${section.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {section.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {section.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </BerylliumLayout>
  );
}

