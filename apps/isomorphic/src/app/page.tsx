import { metaObject } from '@/config/site.config';
import BrandCreationWizard from './(hydrogen)/wizard';

export const metadata = {
  ...metaObject('Создайте свой сайт'),
};

export default function HomePage() {
  return <BrandCreationWizard />;
}
