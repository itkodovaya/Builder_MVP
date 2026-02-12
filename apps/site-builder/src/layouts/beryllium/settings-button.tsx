'use client';

import CogSolidIcon from '@/components/icons/cog-solid';
import { ActionIcon } from 'rizzui';
import cn from '@/utils/class-names';
import { useDrawer } from '@/app/shared/drawer-views/use-drawer';

export default function SettingsButton({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const { openDrawer, closeDrawer } = useDrawer();

  return (
    <ActionIcon
      aria-label="Settings"
      variant="text"
      className={cn(
        'relative h-[34px] w-[34px] shadow backdrop-blur-md dark:bg-gray-100 md:h-9 md:w-9',
        className
      )}
      onClick={() =>
        openDrawer({
          view: (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Настройки</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Настройки будут доступны в будущих версиях
              </p>
            </div>
          ),
          placement: 'right',
          containerClassName: 'max-w-[420px]',
        })
      }
    >
      {children ? (
        children
      ) : (
        <CogSolidIcon
          strokeWidth={1.8}
          className="h-[22px] w-auto animate-spin-slow"
        />
      )}
    </ActionIcon>
  );
}

