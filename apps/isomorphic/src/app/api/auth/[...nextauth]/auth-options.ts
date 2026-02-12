import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { env } from '@/env.mjs';
import { pagesOptions } from './pages-options';
import { ROLES } from '@/config/constants';
import { createFrappeSession } from '@/lib/frappe-auth';

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  pages: {
    ...pagesOptions,
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.idToken as string,
          role: (token.user as any)?.role || null,
        },
        frappeSession: (token as any).frappeSession || null,
      };
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        // return user as JWT with role
        token.user = user;
        token.role = (user as any)?.role;
        
        // Создаем сессию Frappe после успешной аутентификации
        if (user.email) {
          try {
            // Используем email как простой токен для валидации
            // В production здесь должен быть более безопасный подход
            const frappeSession = await createFrappeSession(user.email, user.email);
            if (frappeSession) {
              token.frappeSession = frappeSession;
            }
          } catch (error) {
            // Не прерываем процесс аутентификации, если не удалось создать сессию Frappe
            if (process.env.NODE_ENV === 'development') {
              console.error('Failed to create Frappe session:', error);
            }
          }
        }
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // If redirecting after sign in, go to dashboard
      if (url.includes('/api/auth')) {
        return `${baseUrl}/dashboard`;
      }
      // Allow relative callback URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {},
      async authorize(credentials: any) {
        const email = credentials?.email?.toLowerCase()?.trim();
        const password = credentials?.password;

        // Admin user
        if (email === 'admin@admin.com' && password === 'admin') {
          return {
            email: 'admin@admin.com',
            id: 'admin',
            name: 'Admin User',
            role: ROLES.Administrator,
          } as any;
        }

        // Test user (regular user) - only test12345 password
        if (email === 'test@example.com' && password === 'test12345') {
          return {
            email: 'test@example.com',
            id: 'test-user',
            name: 'Test User',
            role: ROLES.Customer, // Regular user role
          } as any;
        }

        return null;
      },
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID || '',
      clientSecret: env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
};
