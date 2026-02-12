'use client';

import { useIsMounted } from '@core/hooks/use-is-mounted';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import HydrogenLayout from '@/layouts/hydrogen/layout';
import HeliumLayout from '@/layouts/helium/helium-layout';
import LithiumLayout from '@/layouts/lithium/lithium-layout';
import BerylLiumLayout from '@/layouts/beryllium/beryllium-layout';
import BoronLayout from '@/layouts/boron/boron-layout';
import CarbonLayout from '@/layouts/carbon/carbon-layout';
import { useLayout } from '@/layouts/use-layout';
import { LAYOUT_OPTIONS } from '@/config/enums';

type LayoutProps = {
  children: React.ReactNode;
};

export default function DefaultLayout({ children }: LayoutProps) {
  return <LayoutProvider>{children}</LayoutProvider>;
}

function LayoutProvider({ children }: LayoutProps) {
  const pathname = usePathname();
  const { layout } = useLayout();
  const isMounted = useIsMounted();
  const [isHomePage, setIsHomePage] = useState(false);
  const [isFrappeBuilder, setIsFrappeBuilder] = useState(false);

  useEffect(() => {
    if (pathname === '/') {
      setIsHomePage(true);
    } else {
      setIsHomePage(false);
    }
    
    if (pathname === '/frappe-builder') {
      setIsFrappeBuilder(true);
    } else {
      setIsFrappeBuilder(false);
    }
  }, [pathname]);

  // Для главной страницы и frappe-builder не используем layout с sidebar и header
  if (isMounted && (isHomePage || isFrappeBuilder)) {
    return <>{children}</>;
  }

  // Use HELIUM as default to avoid hydration mismatch
  const currentLayout = isMounted ? layout : LAYOUT_OPTIONS.HELIUM;

  if (currentLayout === LAYOUT_OPTIONS.HELIUM) {
    return <HeliumLayout>{children}</HeliumLayout>;
  }
  if (currentLayout === LAYOUT_OPTIONS.LITHIUM) {
    return <LithiumLayout>{children}</LithiumLayout>;
  }
  if (currentLayout === LAYOUT_OPTIONS.BERYLLIUM) {
    return <BerylLiumLayout>{children}</BerylLiumLayout>;
  }
  if (currentLayout === LAYOUT_OPTIONS.BORON) {
    return <BoronLayout>{children}</BoronLayout>;
  }
  if (currentLayout === LAYOUT_OPTIONS.CARBON) {
    return <CarbonLayout>{children}</CarbonLayout>;
  }

  return <HydrogenLayout>{children}</HydrogenLayout>;
}
