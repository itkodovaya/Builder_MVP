'use client';

import {
  brandCreationTotalSteps,
  useBrandCreationStepper,
} from '../wizard';
import cn from '@core/utils/class-names';
import './wizard.css';

interface FormSummaryProps {
  title: string;
  description: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export default function FormSummary({
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
}: FormSummaryProps) {
  const { step } = useBrandCreationStepper();
  return (
    <div className={cn('brand-wizard-form-summary text-base', className)}>
      <div className="flex">
        <span className="step-indicator me-2 mt-2.5 h-0.5 w-11" /> Шаг{' '}
        {step + 1} из {brandCreationTotalSteps}
      </div>
      <article className="mt-4 @3xl:mt-9">
        <h1
          className={cn(
            'text-xl @3xl:text-2xl @7xl:text-3xl @[113rem]:text-4xl',
            titleClassName
          )}
        >
          {title}
        </h1>
        <p
          className={cn(
            'mt-3 text-sm leading-relaxed @3xl:text-base',
            descriptionClassName
          )}
        >
          {description}
        </p>
      </article>
    </div>
  );
}

