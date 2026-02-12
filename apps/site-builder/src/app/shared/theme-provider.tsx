'use client';

import { Provider } from 'jotai';
import { ThemeProvider as NextThemeProvider } from 'next-themes';

export function ThemeProvider({ children }: React.PropsWithChildren<{}>) {
  return (
    <NextThemeProvider
      enableSystem={false}
      themes={['light', 'dark']}
      defaultTheme="light"
      attribute="data-theme"
    >
      {children}
    </NextThemeProvider>
  );
}

export function JotaiProvider({ children }: React.PropsWithChildren<{}>) {
  return <Provider>{children}</Provider>;
}

