'use client';

import { Button } from 'rizzui';
import { PiArrowRightBold, PiRocketLaunch } from 'react-icons/pi';
import cn from '@core/utils/class-names';

interface HeroSectionProps {
  onStartClick: () => void;
}

export default function HeroSection({ onStartClick }: HeroSectionProps) {
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-16 text-center @3xl:py-24 xl:px-7">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-4xl font-bold leading-tight text-white @3xl:text-5xl @5xl:text-6xl @7xl:text-7xl">
          Создайте свой сайт
          <br />
          <span className="text-white/90">за несколько минут</span>
        </h1>
        <p className="mb-10 text-lg leading-relaxed text-white/80 @3xl:text-xl @5xl:mb-12 @5xl:text-2xl">
          Мощный конструктор сайтов с интуитивным интерфейсом. Создавайте
          профессиональные сайты без знания программирования. Начните прямо
          сейчас!
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="xl"
            color="primary"
            onClick={onStartClick}
            className={cn(
              'h-14 gap-2 px-8 text-base font-semibold @3xl:h-16 @3xl:px-10 @3xl:text-lg',
              'bg-white text-[#136A8A] hover:bg-white/90'
            )}
          >
            Создать сайт
            <PiRocketLaunch className="h-5 w-5" />
          </Button>
          <Button
            size="xl"
            variant="outline"
            className={cn(
              'h-14 gap-2 border-white/30 px-8 text-base font-semibold text-white',
              'hover:bg-white/10 @3xl:h-16 @3xl:px-10 @3xl:text-lg'
            )}
          >
            Узнать больше
            <PiArrowRightBold className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}

