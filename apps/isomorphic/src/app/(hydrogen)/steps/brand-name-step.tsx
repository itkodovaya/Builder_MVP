'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Input, Text } from 'rizzui';
import { useAtom } from 'jotai';
import FormSummary from '../wizard/form-summary';
import { useBrandCreationStepper, siteDataAtom } from '../wizard';
import WizardFooter from '../wizard/footer';

const VALID_BRAND_NAME_REGEX = /^[a-zA-Zа-яА-ЯёЁ0-9\s]+$/;

export default function BrandNameStep() {
  const { step, gotoNextStep } = useBrandCreationStepper();
  const [siteData, setSiteData] = useAtom(siteDataAtom);
  const [brandName, setBrandName] = useState(siteData.brandName || '');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { handleSubmit } = useForm();

  const validateBrandName = (name: string): boolean => {
    if (!name.trim()) {
      setValidationError(null);
      return false;
    }
    
    if (!VALID_BRAND_NAME_REGEX.test(name)) {
      setValidationError('Название может содержать только буквы, цифры и пробелы');
      return false;
    }
    
    setValidationError(null);
    return true;
  };

  const handleBrandNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBrandName(value);
    if (value.trim()) {
      validateBrandName(value);
    } else {
      setValidationError(null);
    }
  };

  const onSubmit = () => {
    const trimmedName = brandName.trim();
    if (trimmedName && validateBrandName(trimmedName)) {
      setSiteData({ ...siteData, brandName: trimmedName });
      gotoNextStep();
    }
  };

  const handleNext = () => {
    const trimmedName = brandName.trim();
    if (trimmedName && validateBrandName(trimmedName)) {
      setSiteData((prev) => ({ ...prev, brandName: trimmedName }));
      gotoNextStep();
    }
  };

  const isDisabled = useMemo(() => {
    return !brandName || brandName.trim().length === 0 || !!validationError;
  }, [brandName, validationError]);

  return (
    <>
      <div className="col-span-full flex flex-col justify-center @4xl:col-span-5">
        <FormSummary
          descriptionClassName="@7xl:me-10"
          title="Название вашего бренда"
          description="Введите название вашего бренда или компании. Это название будет отображаться на вашем сайте и поможет пользователям узнать вас."
        />
      </div>

      <form
        id={`rhf-${step.toString()}`}
        onSubmit={handleSubmit(onSubmit)}
        className="col-span-full flex items-center justify-center @4xl:col-span-7"
      >
        <div className="flex-grow rounded-lg bg-white p-5 @4xl:p-7 dark:bg-gray-0">
          <Input
            type="text"
            size="lg"
            label="Название бренда"
            labelClassName="font-semibold text-gray-900"
            placeholder="Например: Моя Компания"
            value={brandName}
            onChange={handleBrandNameChange}
            error={validationError || undefined}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && brandName.trim() && !validationError) {
                handleSubmit(onSubmit)();
              }
            }}
          />
          {validationError && (
            <Text className="mt-2 text-sm text-red-500">{validationError}</Text>
          )}
        </div>
      </form>
      <WizardFooter disabled={isDisabled} onNext={handleNext} />
    </>
  );
}

