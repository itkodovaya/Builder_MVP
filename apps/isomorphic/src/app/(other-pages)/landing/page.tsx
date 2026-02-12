import { metaObject } from '@/config/site.config';
import LandingWizard from './wizard';

export const metadata = {
  ...metaObject('Create Your Website'),
};

export default function LandingPage() {
  return <LandingWizard />;
}

