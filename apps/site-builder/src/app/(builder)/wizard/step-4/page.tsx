import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';

export default function Step4Page() {
  // Step 4 - redirect to dashboard (wizard has 3 steps, this is a fallback)
  redirect(routes.dashboard);
}
