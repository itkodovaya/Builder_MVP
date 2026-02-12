'use client';

import { IndustryStep } from '@/components/wizard/IndustryStep';
import { useSiteWizard } from '@/hooks/use-site-wizard';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';

export default function Step2Page() {
  const router = useRouter();
  const { updateStepData, data } = useSiteWizard();

  const handleSubmit = (industry: string) => {
    updateStepData({ industry });
  };

  const handleNext = () => {
    router.push(routes.wizard.step3);
  };

  const handleBack = () => {
    router.push(routes.wizard.step1);
  };

  return (
    <IndustryStep
      initialValue={data.industry}
      onSubmit={handleSubmit}
      onNext={handleNext}
      onBack={handleBack}
    />
  );
}

