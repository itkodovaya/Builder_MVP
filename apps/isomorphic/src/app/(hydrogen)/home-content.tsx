'use client';

import { useEffect, useState } from 'react';
import BrandCreationWizard from './wizard';
import FileDashboard from '@/app/shared/file/dashboard';

export default function HomeContent() {
  const [hasCreatedSite, setHasCreatedSite] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Проверяем, создал ли пользователь сайт
    // Проверяем localStorage для временных сайтов
    const tempSiteData = localStorage.getItem('tempSiteData');
    
    if (tempSiteData) {
      try {
        const siteData = JSON.parse(tempSiteData);
        // Если сайт создан (даже временный), показываем dashboard
        if (siteData.siteId) {
          setHasCreatedSite(true);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error parsing site data:', error);
        }
      }
    }
    
    setIsChecking(false);
  }, []);

  // Показываем wizard, если сайт не создан
  // Показываем dashboard, если сайт создан (даже временный)

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue mx-auto"></div>
          <p className="text-sm text-gray-500">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (hasCreatedSite) {
    return <FileDashboard />;
  }

  // Всегда показываем wizard, если сайт не создан
  return <BrandCreationWizard />;
}

