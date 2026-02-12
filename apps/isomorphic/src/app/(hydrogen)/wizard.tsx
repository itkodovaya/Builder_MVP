'use client';

import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { atomWithReset } from 'jotai/utils';
import Link from 'next/link';
import { Button } from 'rizzui';
import cn from '@core/utils/class-names';
import BrandNameStep from './steps/brand-name-step';
import BusinessAreaStep from './steps/business-area-step';
import LogoUploadStep from './steps/logo-upload-step';
import LandingPage from './landing/landing-page';
import './wizard/wizard.css';

export enum BrandCreationStep {
  BrandName = 0,
  BusinessArea = 1,
  LogoUpload = 2,
}

const firstStep = BrandCreationStep.BrandName;
export const brandCreationStepperAtom = atomWithReset<BrandCreationStep>(firstStep);

// Атом для хранения данных сайта
export interface SiteData {
  brandName: string;
  businessArea: string;
  logo: File | null;
  logoPreview: string | null;
}

export const siteDataAtom = atomWithReset<SiteData>({
  brandName: '',
  businessArea: '',
  logo: null,
  logoPreview: null,
});

export function useBrandCreationStepper() {
  const [step, setStep] = useAtom(brandCreationStepperAtom);

  function gotoNextStep() {
    setStep((prevStep) => prevStep + 1);
  }
  function gotoPrevStep() {
    setStep(step > firstStep ? step - 1 : step);
  }
  function resetStepper() {
    setStep(firstStep);
  }
  function gotoStep(targetStep: BrandCreationStep) {
    setStep(targetStep);
  }
  return {
    step,
    setStep,
    gotoStep,
    resetStepper,
    gotoNextStep,
    gotoPrevStep,
  };
}

const MAP_STEP_TO_COMPONENT = {
  [BrandCreationStep.BrandName]: BrandNameStep,
  [BrandCreationStep.BusinessArea]: BusinessAreaStep,
  [BrandCreationStep.LogoUpload]: LogoUploadStep,
};

export const brandCreationTotalSteps = Object.keys(MAP_STEP_TO_COMPONENT).length;

export default function BrandCreationWizard() {
  const [step] = useAtom(brandCreationStepperAtom);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    // Проверяем, был ли уже показан визард (например, из localStorage)
    const hasStartedWizard = localStorage.getItem('hasStartedWizard');
    if (hasStartedWizard === 'true') {
      setShowLanding(false);
    }
  }, []);

  const handleStartWizard = () => {
    setShowLanding(false);
    localStorage.setItem('hasStartedWizard', 'true');
  };

  if (showLanding) {
    return <LandingPage onStartClick={handleStartWizard} />;
  }

  const Component = MAP_STEP_TO_COMPONENT[step];

  if (!Component) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-[#136A8A] to-[#267871]">
        <div className="text-center text-white">
          <p className="text-lg">Ошибка: компонент не найден для шага {step}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="brand-wizard-container @container">
      {step === BrandCreationStep.BrandName && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-end px-4 py-4 lg:px-8 4xl:px-10">
          <Link href="/auth/sign-in-1">
            <Button
              rounded="pill"
              variant="outline"
              className="brand-wizard-footer-button-back gap-1 backdrop-blur-lg"
            >
              Войти
            </Button>
          </Link>
        </div>
      )}
      <div
        className={cn(
          'mx-auto grid w-full max-w-screen-2xl grid-cols-12 place-content-center gap-6 px-5 py-10 @3xl:min-h-[calc(100vh-10rem)] @5xl:gap-8 @6xl:gap-16 xl:px-7'
        )}
      >
        <Component />
      </div>
    </div>
  );
}

