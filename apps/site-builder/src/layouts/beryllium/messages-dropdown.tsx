'use client';

import { useMedia } from '@/hooks/use-media';
import { RefObject, useState } from 'react';
import { Badge, Popover, Text, Title } from 'rizzui';

function MessagesList({
  setIsOpen,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="w-[320px] text-left sm:w-[360px] 2xl:w-[420px] rtl:text-right">
      <div className="mb-2 flex items-center justify-between ps-6">
        <Title as="h5" fontWeight="semibold">
          Сообщения
        </Title>
      </div>
      <div className="custom-scrollbar overflow-y-auto scroll-smooth max-h-[406px]">
        <div className="grid grid-cols-1 ps-4">
          <div className="group grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] gap-2.5 rounded-md px-2 py-2.5 pe-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-50">
            <Text className="text-sm text-gray-500">Нет сообщений</Text>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagesDropdown({
  children,
}: {
  children: React.ReactElement & { ref?: RefObject<any> };
}) {
  const isMobile = useMedia('(max-width: 480px)', false);
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      shadow="sm"
      placement={isMobile ? 'bottom' : 'bottom-end'}
    >
      <Popover.Trigger>{children}</Popover.Trigger>
      <Popover.Content className="z-[9999] pb-6 pe-6 ps-0 pt-5 dark:bg-gray-100 [&>svg]:hidden [&>svg]:dark:fill-gray-100 sm:[&>svg]:inline-flex">
        <MessagesList setIsOpen={setIsOpen} />
      </Popover.Content>
    </Popover>
  );
}

