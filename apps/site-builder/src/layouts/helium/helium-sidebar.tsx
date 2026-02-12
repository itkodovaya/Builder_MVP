'use client';

import cn from '@/utils/class-names';
import { HeliumSidebarMenu } from './helium-sidebar-menu';

export default function HeliumSidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        'fixed bottom-0 start-0 z-50 h-full w-[284px] dark:bg-gray-100/50 xl:p-5 2xl:w-[308px]',
        className
      )}
    >
      <div className="h-full bg-gray-900 p-1.5 pl-0 pr-1.5 dark:bg-gray-100/70 xl:rounded-2xl">
        <div className="custom-scrollbar h-full overflow-y-auto scroll-smooth">
          <HeliumSidebarMenu />
        </div>
      </div>
    </aside>
  );
}

