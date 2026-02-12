'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, type AdminStats } from '@/lib/api/admin';
import { requireAdmin } from '@/lib/utils/auth';
import BerylliumLayout from '@/layouts/beryllium/beryllium-layout';
import toast from 'react-hot-toast';
import { PiUsers, PiGlobe, PiFileText, PiFolderOpen } from 'react-icons/pi';

export default function AdminStatsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const isAdmin = await requireAdmin();
      if (!isAdmin) {
        return;
      }
      loadStats();
    };

    checkAdmin();
  }, [router]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('Error loading stats:', error);
      toast.error(error.message || 'Не удалось загрузить статистику');
    } finally {
      setLoading(false);
    }
  };

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

  if (!stats) {
    return (
      <BerylliumLayout>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">Не удалось загрузить статистику</p>
        </div>
      </BerylliumLayout>
    );
  }

  const statCards = [
    {
      title: 'Всего пользователей',
      value: stats.users.total,
      icon: PiUsers,
      color: 'bg-blue-500',
      details: [
        { label: 'Админов', value: stats.users.admins },
        { label: 'Пользователей', value: stats.users.regular },
      ],
    },
    {
      title: 'Всего черновиков',
      value: stats.drafts.total,
      icon: PiFolderOpen,
      color: 'bg-orange-500',
    },
    {
      title: 'Активных шаблонов',
      value: stats.templates.total,
      icon: PiFileText,
      color: 'bg-purple-500',
    },
    ...(stats.sites ? [{
      title: 'Всего сайтов',
      value: stats.sites.total,
      icon: PiGlobe,
      color: 'bg-green-500',
    }] : []),
  ];

  return (
    <BerylliumLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Статистика системы
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Общая информация о системе
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {card.title}
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {card.value}
                </p>
                {card.details && (
                  <div className="mt-4 space-y-1">
                    {card.details.map((detail, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{detail.label}:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </BerylliumLayout>
  );
}

