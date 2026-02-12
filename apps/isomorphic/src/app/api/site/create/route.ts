import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { env } from '@/env.mjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const { brandName, businessArea, logo, logoPreview } = body;

    if (!brandName || !businessArea) {
      return NextResponse.json(
        { error: 'Brand name and business area are required' },
        { status: 400 }
      );
    }

    const frappeApiUrl = env.NEXT_PUBLIC_FRAPPE_API_URL || 'http://localhost:8000';
    let logoUrl: string | null = null;

    // Если есть логотип, загружаем его в Frappe
    if (logoPreview) {
      try {
        // Для начала используем logoPreview как URL
        // В будущем можно добавить загрузку файла через upload_builder_asset
        logoUrl = logoPreview;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to upload logo to Frappe:', error);
        }
        // Продолжаем без логотипа
      }
    }

    // Создаем сайт в Frappe Builder
    let frappePageData = null;
    try {
      // Проверяем доступность Frappe сервера
      try {
        const healthCheck = await fetch(`${frappeApiUrl}/api/method/ping`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000), // 5 секунд таймаут
        });
        if (!healthCheck.ok) {
          throw new Error('Frappe server is not responding');
        }
      } catch (healthError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Frappe server health check failed:', healthError);
        }
        throw new Error('Frappe сервер недоступен. Убедитесь, что сервер запущен на http://localhost:8000');
      }

      console.log('[Site Create] Calling Frappe API:', `${frappeApiUrl}/api/method/builder.api.create_site_from_wizard`);
      
      const frappeResponse = await fetch(
        `${frappeApiUrl}/api/method/builder.api.create_site_from_wizard`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            brand_name: brandName,
            business_area: businessArea,
            logo_url: logoUrl,
          }),
          signal: AbortSignal.timeout(30000), // 30 секунд таймаут
        }
      );

      console.log('[Site Create] Frappe response status:', frappeResponse.status, frappeResponse.statusText);

      if (!frappeResponse.ok) {
        let errorMessage = 'Failed to create site in Frappe';
        try {
          const errorData = await frappeResponse.json();
          if (errorData.exc_type) {
            errorMessage = `Frappe error: ${errorData.exc_type}`;
            if (errorData.exc) {
              errorMessage += ` - ${errorData.exc}`;
            }
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // Если не удалось распарсить JSON, используем текст ответа
          const text = await frappeResponse.text().catch(() => '');
          errorMessage = text || `HTTP ${frappeResponse.status}: ${frappeResponse.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const frappeResult = await frappeResponse.json();
      
      // Проверяем структуру ответа Frappe
      // Frappe API возвращает данные в формате { message: {...} }
      if (!frappeResult || typeof frappeResult !== 'object') {
        throw new Error('Invalid response format from Frappe API');
      }
      
      // Если есть exc_type, значит произошла ошибка
      if (frappeResult.exc_type) {
        const errorMsg = frappeResult.exc || frappeResult.message || 'Unknown Frappe error';
        throw new Error(`Frappe error: ${errorMsg}`);
      }
      
      // Получаем данные из message
      frappePageData = frappeResult.message;
      
      if (!frappePageData) {
        throw new Error('Frappe API did not return message data');
      }
      
      if (!frappePageData.page_name) {
        throw new Error('Frappe API did not return page name');
      }
    } catch (error) {
      // Логируем полную ошибку для отладки
      console.error('Error creating site in Frappe:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', errorMessage);
      
      // Возвращаем ошибку с деталями
      return NextResponse.json(
        { 
          error: 'Failed to create site in Frappe Builder',
          details: errorMessage,
          stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
        },
        { status: 500 }
      );
    }

    // Сохраняем данные сайта
    const siteData = {
      id: frappePageData?.page_name || `site_${Date.now()}`,
      brandName,
      businessArea,
      logo: logo || null,
      logoPreview: logoPreview || null,
      userId: session?.user?.email || null,
      createdAt: new Date().toISOString(),
      isTemporary: !session,
      frappePageName: frappePageData?.page_name,
      frappeRoute: frappePageData?.route,
    };

    return NextResponse.json({
      success: true,
      site: siteData,
      frappePage: frappePageData,
      message: session 
        ? 'Site created successfully' 
        : 'Temporary site created. Register to save it permanently.',
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating site:', error);
    }
    return NextResponse.json(
      { error: 'Failed to create site' },
      { status: 500 }
    );
  }
}

