/**
 * Утилиты для работы с Frappe API и интеграции аутентификации
 */

// Используем переменную окружения или значение по умолчанию
function getFrappeApiUrl(): string {
  // В Next.js 13+ process.env доступен и на сервере, и на клиенте
  return process.env.NEXT_PUBLIC_FRAPPE_API_URL || 'http://localhost:8000';
}

export interface FrappeSessionResponse {
  success: boolean;
  user: string;
  sid: string;
  message: string;
}

/**
 * Создает сессию Frappe на основе данных из NextAuth
 * @param email Email пользователя
 * @param token JWT токен от NextAuth
 * @returns Информация о созданной сессии или null при ошибке
 */
export async function createFrappeSession(
  email: string,
  token: string
): Promise<FrappeSessionResponse | null> {
  try {
    const apiUrl = getFrappeApiUrl();
    const response = await fetch(`${apiUrl}/api/method/builder.api.create_session_from_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        token,
      }),
      credentials: 'include', // Важно для сохранения cookies сессии
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create session' }));
      console.error('Failed to create Frappe session:', error);
      return null;
    }

    const data = await response.json();
    
    if (data.message && data.message.success) {
      return data.message as FrappeSessionResponse;
    }

    return null;
  } catch (error) {
    console.error('Error creating Frappe session:', error);
    return null;
  }
}

/**
 * Получает токен сессии Frappe (если доступен)
 * @returns Токен сессии или null
 */
export function getFrappeSessionToken(): string | null {
  // В браузере можно получить из cookies
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    const sidCookie = cookies.find((cookie) => cookie.trim().startsWith('sid='));
    if (sidCookie) {
      return sidCookie.split('=')[1];
    }
  }
  return null;
}

/**
 * Проверяет, есть ли активная сессия Frappe
 * @returns true если сессия активна, false иначе
 */
export async function checkFrappeSession(): Promise<boolean> {
  try {
    const apiUrl = getFrappeApiUrl();
    const response = await fetch(`${apiUrl}/api/method/frappe.auth.get_logged_user`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.message && data.message !== 'Guest';
  } catch (error) {
    console.error('Error checking Frappe session:', error);
    return false;
  }
}

/**
 * Получает URL для доступа к Frappe Builder
 * @param path Путь внутри builder (опционально)
 * @returns Полный URL для доступа к Builder
 */
export function getFrappeBuilderUrl(path: string = ''): string {
  const apiUrl = getFrappeApiUrl();
  const builderPath = path ? `/${path}` : '';
  return `${apiUrl}/builder${builderPath}`;
}

