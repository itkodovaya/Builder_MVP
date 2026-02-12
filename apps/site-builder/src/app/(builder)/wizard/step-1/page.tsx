'use client';

import { BrandNameStep } from '@/components/wizard/BrandNameStep';
import { useSiteWizard } from '@/hooks/use-site-wizard';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';

export default function Step1Page() {
  const router = useRouter();
  const { updateStepData, data } = useSiteWizard();

  const handleSubmit = (brandName: string) => {
    updateStepData({ brandName });
  };

  const handleNext = () => {
    router.push(routes.wizard.step2);
  };

  return (
    <BrandNameStep
      initialValue={data.brandName}
      onSubmit={handleSubmit}
      onNext={handleNext}
    />
  );
}

