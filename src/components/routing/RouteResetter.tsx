'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLoader } from '@/contexts/LoaderContext';

export default function RouteResetter() {
  const pathname = usePathname();
  const { hideLoader } = useLoader();

  useEffect(() => {
    hideLoader(); // Loader akan di-hide setiap kali path berubah
  }, [pathname, hideLoader]);

  return null;
}
