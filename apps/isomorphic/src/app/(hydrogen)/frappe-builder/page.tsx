import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { metaObject } from '@/config/site.config';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { routes } from '@/config/routes';
import FrappeBuilderIframe from './frappe-builder-iframe';

export const metadata = {
  ...metaObject('Frappe Builder'),
};

export default async function FrappeBuilderPage() {
  const session = await getServerSession(authOptions);
  
  // Если пользователь не авторизован, редиректим на landing страницу
  if (!session) {
    redirect(routes.landing);
  }
  
  return <FrappeBuilderIframe userEmail={session.user?.email || ''} />;
}

