import { metaObject } from '@/config/site.config';
import EcommerceDashboard from '@/app/shared/ecommerce/dashboard';

export const metadata = {
  ...metaObject('Dashboard'),
};

export default function DashboardPage() {
  return <EcommerceDashboard />;
}

