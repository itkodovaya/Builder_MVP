'use client';

import { useAtom } from 'jotai';
import { atomWithReset } from 'jotai/utils';
import cn from '@core/utils/class-names';
import DemoStep from './steps/demo-step';
import SignUpStep from './steps/signup-step';
import SignInStep from './steps/signin-step';

export enum LandingStep {
  Demo = 0,
  SignUp = 1,
  SignIn = 2,
}

const firstStep = LandingStep.Demo;
export const landingStepperAtom = atomWithReset<LandingStep>(firstStep);

export function useLandingStepper() {
  const [step, setStep] = useAtom(landingStepperAtom);

  function gotoNextStep() {
    setStep(step + 1);
  }
  function gotoPrevStep() {
    setStep(step > firstStep ? step - 1 : step);
  }
  function resetStepper() {
    setStep(firstStep);
  }
  function gotoStep(targetStep: LandingStep) {
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
  [LandingStep.Demo]: DemoStep,
  [LandingStep.SignUp]: SignUpStep,
  [LandingStep.SignIn]: SignInStep,
};

export const landingTotalSteps = Object.keys(MAP_STEP_TO_COMPONENT).length;

export default function LandingWizard() {
  const [step] = useAtom(landingStepperAtom);
  const Component = MAP_STEP_TO_COMPONENT[step];

  return (
    <div
      className={cn(
        'mx-auto grid w-full max-w-screen-2xl grid-cols-12 place-content-center gap-6 px-5 py-10 @3xl:min-h-[calc(100vh-10rem)] @5xl:gap-8 @6xl:gap-16 xl:px-7'
      )}
    >
      <Component />
    </div>
  );
}

