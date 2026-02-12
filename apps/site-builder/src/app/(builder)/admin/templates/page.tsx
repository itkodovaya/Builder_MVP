'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, type AdminTemplate } from '@/lib/api/admin';
import { requireAdmin } from '@/lib/utils/auth';
import BerylliumLayout from '@/layouts/beryllium/beryllium-layout';
import toast from 'react-hot-toast';

export default function AdminTemplatesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);

  useEffect(() => {
    const checkAdmin = async () => {
      const isAdmin = await requireAdmin();
      if (!isAdmin) {
        return;
      }
      loadTemplates();
    };

    checkAdmin();
  }, [router]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllTemplates();
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (error: any) {
      console.error('Error loading templates:', error);
      toast.error(error.message || 'Не удалось загрузить шаблоны');
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

  return (
    <BerylliumLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Управление шаблонами
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Всего шаблонов: {templates.length}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {template.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                ID: {template.id}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Версия: {template.version}
              </p>
              <div className="mt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Индустрии:</p>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(template.industry) ? (
                    template.industry.map((ind, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                      >
                        {ind}
                      </span>
                    ))
                  ) : (
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                      {template.industry}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BerylliumLayout>
  );
}

