"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import RouteLoader from '@/components/routing/RouteLoader';
import RouteResetter from '@/components/routing/RouteResetter';
import { getCartToken } from '@/lib/cart/getCartToken';

// Dynamic import Cart untuk mengurangi beban SSR
const Cart = dynamic(() => import('@/components/sections/Cart/Cart'), {
  ssr: false,
});

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    getCartToken();
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="
          fixed inset-0 z-50 flex items-center justify-center 
          w-screen h-screen overflow-hidden
          text-gray-900 dark:text-white transition-colors duration-300
          bg-gradient-to-b from-gray-50 via-white to-gray-100
          dark:from-black dark:via-[#0a0613] dark:to-[#1a102e]
        "
      >
        <span className="animate-pulse text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <>
      <Header onCartClick={() => setIsCartOpen(true)} />
      <RouteLoader />
      <RouteResetter />
      <main className="min-h-screen">{children}</main>
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
