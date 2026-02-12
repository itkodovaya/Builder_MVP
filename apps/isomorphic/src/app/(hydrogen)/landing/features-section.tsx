'use client';

import { PiLightning, PiShieldCheck, PiDeviceMobile, PiChartLineUp } from 'react-icons/pi';
import cn from '@core/utils/class-names';

const features = [
  {
    icon: PiLightning,
    title: 'Быстрое создание',
    description: 'Создайте свой сайт за считанные минуты с помощью нашего интуитивного конструктора',
  },
  {
    icon: PiShieldCheck,
    description: 'Ваши данные в безопасности. Мы используем современные технологии защиты',
    title: 'Безопасность',
  },
  {
    icon: PiDeviceMobile,
    title: 'Адаптивный дизайн',
    description: 'Ваш сайт будет отлично выглядеть на всех устройствах - от смартфонов до десктопов',
  },
  {
    icon: PiChartLineUp,
    title: 'Аналитика',
    description: 'Отслеживайте посещаемость и анализируйте поведение посетителей вашего сайта',
  },
];

export default function FeaturesSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 @3xl:py-24 xl:px-7">
      <div className="mb-12 text-center @3xl:mb-16">
        <h2 className="mb-4 text-3xl font-bold text-white @3xl:text-4xl @5xl:text-5xl">
          Почему выбирают нас
        </h2>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/80 @3xl:text-lg">
          Мы предлагаем все необходимое для создания профессионального сайта
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 @3xl:grid-cols-2 @5xl:grid-cols-4 @5xl:gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className={cn(
                'rounded-2xl bg-white/10 p-6 backdrop-blur-lg transition-all',
                'hover:bg-white/15 hover:shadow-xl @3xl:p-8'
              )}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 @3xl:h-14 @3xl:w-14">
                <Icon className="h-6 w-6 text-white @3xl:h-7 @3xl:w-7" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white @3xl:text-2xl">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/80 @3xl:text-base">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

