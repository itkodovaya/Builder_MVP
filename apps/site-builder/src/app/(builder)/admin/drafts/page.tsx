'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, type AdminDraft } from '@/lib/api/admin';
import { requireAdmin } from '@/lib/utils/auth';
import BerylliumLayout from '@/layouts/beryllium/beryllium-layout';
import toast from 'react-hot-toast';
import { PiTrash } from 'react-icons/pi';

export default function AdminDraftsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<AdminDraft[]>([]);

  useEffect(() => {
    const checkAdmin = async () => {
      const isAdmin = await requireAdmin();
      if (!isAdmin) {
        return;
      }
      loadDrafts();
    };

    checkAdmin();
  }, [router]);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllDrafts();
      if (response.success && response.data) {
        setDrafts(response.data);
      }
    } catch (error: any) {
      console.error('Error loading drafts:', error);
      toast.error(error.message || 'Не удалось загрузить черновики');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (draftId: string, brandName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить черновик "${brandName}"?`)) {
      return;
    }

    try {
      const response = await adminApi.deleteDraft(draftId);
      if (response.success) {
        toast.success('Черновик удален');
        loadDrafts();
      }
    } catch (error: any) {
      console.error('Error deleting draft:', error);
      toast.error(error.message || 'Не удалось удалить черновик');
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
            Управление черновиками
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Всего черновиков: {drafts.length}
          </p>
        </div>

        {drafts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">Нет черновиков</p>
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
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Создан
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Истекает
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {drafts.map((draft) => (
                    <tr key={draft.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {draft.brandName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {draft.industry}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {draft.hasLogo && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                              Лого
                            </span>
                          )}
                          {draft.hasConfig && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                              Конфиг
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(draft.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {draft.expiresAt ? new Date(draft.expiresAt).toLocaleDateString('ru-RU') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(draft.id, draft.brandName)}
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

