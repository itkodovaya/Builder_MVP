'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, type AdminSite } from '@/lib/api/admin';
import { requireAdmin } from '@/lib/utils/auth';
import BerylliumLayout from '@/layouts/beryllium/beryllium-layout';
import toast from 'react-hot-toast';
import { Button } from 'rizzui';
import { PiTrash } from 'react-icons/pi';

export default function AdminSitesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState<AdminSite[]>([]);

  useEffect(() => {
    const checkAdmin = async () => {
      const isAdmin = await requireAdmin();
      if (!isAdmin) {
        return;
      }
      loadSites();
    };

    checkAdmin();
  }, [router]);

  const loadSites = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllSites();
      if (response.success && response.data) {
        setSites(response.data);
      }
    } catch (error: any) {
      console.error('Error loading sites:', error);
      toast.error(error.message || 'Не удалось загрузить сайты');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (siteId: string, brandName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить сайт "${brandName}"?`)) {
      return;
    }

    try {
      const response = await adminApi.deleteSite(siteId);
      if (response.success) {
        toast.success('Сайт удален');
        loadSites();
      }
    } catch (error: any) {
      console.error('Error deleting site:', error);
      toast.error(error.message || 'Не удалось удалить сайт');
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

  return (
    <BerylliumLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Управление сайтами
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Всего сайтов: {sites.length}
          </p>
        </div>

        {sites.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">Нет сайтов</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Название
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Индустрия
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Создан
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sites.map((site) => (
                    <tr key={site.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {site.brandName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {site.industry}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(site.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(site.id, site.brandName)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <PiTrash className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </BerylliumLayout>
  );
}

