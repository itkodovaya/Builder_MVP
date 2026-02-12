'use client';

import { Button } from 'rizzui';
import { PiRocketLaunch } from 'react-icons/pi';
import cn from '@core/utils/class-names';

interface CTASectionProps {
  onStartClick: () => void;
}

export default function CTASection({ onStartClick }: CTASectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 @3xl:py-24 xl:px-7">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white/10 p-8 text-center backdrop-blur-lg @3xl:p-12 @5xl:p-16">
        <h2 className="mb-4 text-3xl font-bold text-white @3xl:text-4xl @5xl:text-5xl">
          Готовы начать?
        </h2>
        <p className="mb-8 text-base leading-relaxed text-white/80 @3xl:mb-10 @3xl:text-lg @5xl:text-xl">
          Создайте свой сайт прямо сейчас и начните привлекать клиентов уже
          сегодня
        </p>
        <Button
          size="xl"
          color="primary"
          onClick={onStartClick}
          className={cn(
            'h-14 gap-2 px-8 text-base font-semibold @3xl:h-16 @3xl:px-10 @3xl:text-lg',
            'bg-white text-[#136A8A] hover:bg-white/90'
          )}
        >
          Начать создание
          <PiRocketLaunch className="h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}

