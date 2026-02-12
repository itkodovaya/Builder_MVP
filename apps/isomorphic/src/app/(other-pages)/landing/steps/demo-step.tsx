'use client';

import { Button } from 'rizzui';
import { Title, Text } from 'rizzui/typography';
import { PiArrowRightBold } from 'react-icons/pi';
import { useLandingStepper } from '../wizard';

export default function DemoStep() {
  const { gotoNextStep } = useLandingStepper();

  return (
    <>
      <div className="col-span-full flex flex-col justify-center @4xl:col-span-5">
        <Title
          as="h2"
          className="mb-3 text-[22px] font-bold leading-snug sm:text-2xl md:mb-5 md:text-3xl md:leading-snug xl:mb-7 xl:text-4xl xl:leading-normal 2xl:text-[40px]"
        >
          Создайте свой сайт <br />
          за несколько минут
        </Title>
        <Text className="mb-6 max-w-[612px] text-sm leading-loose text-gray-500 md:mb-8 xl:mb-10 xl:text-base xl:leading-loose">
          Создайте профессиональный сайт для вашего бизнеса всего за несколько шагов.
          Начните создавать свой сайт прямо сейчас!
        </Text>
        <div className="mt-8 flex flex-col gap-4 lg:flex-row xl:gap-6">
          <Button
            color="primary"
            size="lg"
            className="h-12 px-4 xl:h-14 xl:px-6"
            onClick={gotoNextStep}
          >
            Создать свой сайт
            <PiArrowRightBold className="ms-2 h-5 w-5" />
          </Button>
        </div>
        <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
          <span>Шаг 1 из 3</span>
          <span>•</span>
          <span>Демо сайта</span>
        </div>
      </div>

      <div className="col-span-full @4xl:col-span-7">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-8xl">🌐</div>
              <Text className="text-lg font-semibold text-gray-700">
                Ваш сайт будет здесь
              </Text>
              <Text className="mt-2 text-sm text-gray-500">
                Создайте красивый и функциональный сайт за несколько минут
              </Text>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

