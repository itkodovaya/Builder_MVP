import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { inter, lexendDeca } from '@/app/fonts';
import cn from '@/utils/class-names';
import { ThemeProvider, JotaiProvider } from '@/app/shared/theme-provider';
import GlobalDrawer from '@/app/shared/drawer-views/container';

import './globals.css';

export const metadata: Metadata = {
  title: 'Site Builder - Конструктор сайтов',
  description: 'Создайте свой сайт за несколько минут',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={cn(inter.variable, lexendDeca.variable, 'font-inter')}>
        <ThemeProvider>
          <JotaiProvider>
            {children}
            <GlobalDrawer />
            <Toaster />
          </JotaiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

