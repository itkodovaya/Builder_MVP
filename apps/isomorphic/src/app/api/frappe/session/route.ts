import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { createFrappeSession } from '@/lib/frappe-auth';
import { NextResponse } from 'next/server';

/**
 * API route для создания сессии Frappe на основе сессии NextAuth
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Создаем сессию Frappe
    const frappeSession = await createFrappeSession(
      session.user.email,
      session.user.email // В production здесь должен быть более безопасный токен
    );

    if (!frappeSession) {
      return NextResponse.json(
        { error: 'Failed to create Frappe session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, session: frappeSession });
  } catch (error) {
    console.error('Error creating Frappe session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * API route для проверки наличия сессии Frappe
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Проверяем наличие сессии Frappe в токене NextAuth
    if (session.frappeSession) {
      return NextResponse.json({ 
        success: true, 
        hasSession: true,
        session: session.frappeSession 
      });
    }

    return NextResponse.json({ 
      success: true, 
      hasSession: false 
    });
  } catch (error) {
    console.error('Error checking Frappe session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

