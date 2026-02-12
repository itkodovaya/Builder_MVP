'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { configuratorApi } from '@/lib/api/configurator';
import { authApi } from '@/lib/api/auth';
import { routes } from '@/config/routes';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = searchParams.get('siteId');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [companyName, setCompanyName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchSiteData = async () => {
      if (!siteId) return;
      
      try {
        const site = await configuratorApi.getSite(siteId);
        setCompanyName(site.brandName || '');
      } catch (error) {
        console.error('Error fetching site data:', error);
        toast.error('Не удалось загрузить данные сайта');
      }
    };

    fetchSiteData();
  }, [siteId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!siteId) {
      toast.error('Site ID не найден');
      return;
    }

    setLoading(true);

    try {
      toast.loading('Регистрация...', { id: 'register' });

      // Step 1: Register user
      const registerResponse = await authApi.register({
        email: formData.email,
        password: formData.password,
        siteId: siteId,
      });

      if (!registerResponse.success || !registerResponse.data) {
        const errorMessage = registerResponse.error?.message || 'Ошибка при регистрации';
        toast.error(errorMessage, { id: 'register' });
        throw new Error(errorMessage);
      }

      const userId = registerResponse.data.userId;

      // Step 2: Migrate draft to permanent site
      const migrationResult = await configuratorApi.migrateDraft(siteId, userId);

      if (migrationResult.success && migrationResult.data) {
        toast.success('Регистрация успешна! Сайт сохранен.', { id: 'register' });
        // Redirect to success page or dashboard
        // In production, you might want to redirect to a dashboard or home page
        router.push(`/success?siteId=${migrationResult.data.siteId}`);
      } else {
        const errorMessage = migrationResult.error?.message || 'Ошибка миграции сайта';
        toast.error(errorMessage, { id: 'register' });
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при регистрации';
      toast.error(errorMessage, { id: 'register' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    // Reset email sent status when email changes
    if (name === 'email') {
      setEmailSent(false);
    }
  };

  const handleSendEmail = async () => {
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: 'Введите email для отправки пароля' }));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: 'Некорректный email' }));
      return;
    }

    setSendingEmail(true);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.email;
      return newErrors;
    });

    try {
      // TODO: Replace with actual API call to send password email
      // Example: await configuratorApi.sendPasswordEmail(siteId, formData.email);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success('Пароль отправлен на указанный email');
      setEmailSent(true);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Не удалось отправить письмо. Попробуйте еще раз.');
    } finally {
      setSendingEmail(false);
    }
  };

  if (!siteId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-red-600">Ошибка</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Site ID не найден. Вернитесь к созданию сайта.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Регистрация</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
          Зарегистрируйтесь, чтобы сохранить ваш сайт
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {companyName && (
            <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Название компании
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {companyName}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                placeholder="example@email.com"
              />
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sendingEmail || emailSent}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {sendingEmail ? 'Отправка...' : emailSent ? 'Отправлено' : 'Отправить'}
              </button>
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
            {emailSent && !errors.email && (
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                Пароль отправлен на указанный email
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Пароль из письма
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
              placeholder="Введите пароль из письма"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Уже есть аккаунт?{' '}
            <Link
              href={routes.login}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Войти
            </Link>
          </p>
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    </div>
  );
}

