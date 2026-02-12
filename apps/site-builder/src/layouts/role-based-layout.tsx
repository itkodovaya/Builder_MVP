'use client';

import { useEffect, useState } from 'react';
import BerylliumLayout from '@/layouts/beryllium/beryllium-layout';
import HeliumLayout from '@/layouts/helium/helium-layout';
import { getUserRoleSync, type UserRole } from '@/lib/utils/auth';

export default function RoleBasedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    setRole(getUserRoleSync());
  }, []);

  // Until we know the role, default to Helium (safer for regular users)
  if (role === 'admin') {
    return <BerylliumLayout>{children}</BerylliumLayout>;
  }

  return <HeliumLayout>{children}</HeliumLayout>;
}


