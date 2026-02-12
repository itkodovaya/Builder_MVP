'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AdvancedRadio, RadioGroup } from 'rizzui';
import { useAtom } from 'jotai';
import FormSummary from '../wizard/form-summary';
import { useBrandCreationStepper, siteDataAtom } from '../wizard';
import WizardFooter from '../wizard/footer';

const businessAreas = [
  { name: 'ecommerce', label: 'Интернет-магазин', icon: '🛒' },
  { name: 'business', label: 'Бизнес и услуги', icon: '💼' },
  { name: 'education', label: 'Образование', icon: '📚' },
  { name: 'healthcare', label: 'Здоровье и медицина', icon: '🏥' },
  { name: 'restaurant', label: 'Рестораны и кафе', icon: '🍽️' },
  { name: 'real-estate', label: 'Недвижимость', icon: '🏠' },
  { name: 'travel', label: 'Туризм и путешествия', icon: '✈️' },
  { name: 'fitness', label: 'Спорт и фитнес', icon: '💪' },
  { name: 'art', label: 'Искусство и творчество', icon: '🎨' },
  { name: 'tech', label: 'Технологии', icon: '💻' },
  { name: 'fashion', label: 'Мода и стиль', icon: '👗' },
  { name: 'other', label: 'Другое', icon: '📋' },
];

export default function BusinessAreaStep() {
  const { step, gotoNextStep } = useBrandCreationStepper();
  const [siteData, setSiteData] = useAtom(siteDataAtom);
  const [businessArea, setBusinessArea] = useState(siteData.businessArea);

  const { handleSubmit } = useForm();

  const onSubmit = () => {
    if (businessArea) {
      setSiteData({ ...siteData, businessArea });
      gotoNextStep();
    }
  };

  const handleNext = () => {
    if (businessArea) {
      setSiteData({ ...siteData, businessArea });
      gotoNextStep();
    }
  };

  return (
    <>
      <div className="col-span-full flex flex-col justify-center @5xl:col-span-5">
        <FormSummary
          className="@7xl:me-10"
          title="Сфера деятельности"
          description="Выберите сферу деятельности вашего бизнеса. Это поможет нам предложить подходящие шаблоны и функции для вашего сайта."
        />
      </div>

      <div className="col-span-full flex items-center justify-center @5xl:col-span-7">
        <form
          id={`rhf-${step.toString()}`}
          onSubmit={handleSubmit(onSubmit)}
          className="flex-grow rounded-lg bg-white p-5 @4xl:p-7 dark:bg-gray-0"
        >
          <RadioGroup
            value={businessArea}
            setValue={setBusinessArea}
            className="col-span-full grid grid-cols-2 gap-4 @3xl:grid-cols-3 @4xl:gap-6 @6xl:grid-cols-3"
          >
            {businessAreas.map((area) => (
              <AdvancedRadio
                key={area.name}
                value={area.name}
                className="[&_.rizzui-advanced-radio]:px-6 [&_.rizzui-advanced-radio]:py-6"
                inputClassName="[&~span]:border-0 [&~span]:ring-1 [&~span]:ring-gray-200 [&~span:hover]:ring-primary [&:checked~span:hover]:ring-primary [&:checked~span]:border-1 [&:checked~.rizzui-advanced-radio]:ring-2 [&~span_.icon]:opacity-0 [&:checked~span_.icon]:opacity-100"
              >
                <span className="mb-4 block text-4xl">{area.icon}</span>
                <span className="font-semibold">{area.label}</span>
              </AdvancedRadio>
            ))}
          </RadioGroup>
        </form>
      </div>
      <WizardFooter disabled={!businessArea} onNext={handleNext} />
    </>
  );
}

