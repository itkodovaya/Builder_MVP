'use client';

import { PiArrowUpLight, PiCheck } from 'react-icons/pi';
import { Button } from 'rizzui';
import cn from '@core/utils/class-names';
import {
  brandCreationTotalSteps,
  useBrandCreationStepper,
  BrandCreationStep,
} from '../wizard';
import './wizard.css';

interface FooterProps {
  className?: string;
  isLoading?: boolean;
  onNext?: () => void;
  disabled?: boolean;
}

function buttonLabel(step: BrandCreationStep, totalSteps: number) {
  if (step === totalSteps - 1) {
    return (
      <>
        Создать сайт <PiCheck />
      </>
    );
  }
  return (
    <>
      Далее <PiArrowUpLight className="rotate-90" />
    </>
  );
}

export default function WizardFooter({
  isLoading,
  className,
  onNext,
  disabled,
}: FooterProps) {
  const { step, gotoPrevStep } = useBrandCreationStepper();

  const handleNextClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onNext) {
      onNext();
    } else {
      const form = document.getElementById(`rhf-${step?.toString()}`);
      if (form) {
        (form as HTMLFormElement).requestSubmit();
      }
    }
  };

  return (
    <footer
      className={cn(
        'fixed bottom-0 left-0 right-0 flex items-center justify-between gap-3 px-4 py-5 lg:px-8 4xl:px-10',
        className
      )}
    >
      {step > 0 && step < brandCreationTotalSteps && (
        <Button
          rounded="pill"
          variant="outline"
          onClick={gotoPrevStep}
          className="brand-wizard-footer-button-back gap-1 backdrop-blur-lg"
        >
          <PiArrowUpLight className="-rotate-90" />
          Назад
        </Button>
      )}
      <Button
        isLoading={isLoading}
        disabled={isLoading || disabled}
        rounded="pill"
        onClick={handleNextClick}
        type="button"
        className="brand-wizard-footer-button-next ml-auto gap-1 backdrop-blur-lg"
        style={{ pointerEvents: disabled ? 'none' : 'auto' }}
      >
        {buttonLabel(step, brandCreationTotalSteps)}
      </Button>
    </footer>
  );
}

