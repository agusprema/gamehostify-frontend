"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getCartToken } from '@/lib/cart/getCartToken';
import Wrapper from '@/components/ui/Wrapper';
import { Loader2 } from 'lucide-react';

const Cart = dynamic(() => import('./Cart'), { ssr: false });

let openCartCallback: (() => void) | null = null;

export function openCart() {
  if (openCartCallback) openCartCallback();
}

export default function CartClient() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    getCartToken();
    setMounted(true);
    openCartCallback = () => setIsCartOpen(true);
    return () => {
      openCartCallback = null;
    };
  }, []);

  if (!mounted) {
    // Loader fullscreen agar user melihat loading sebelum interaksi
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center w-screen h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
        <Loader2 className="h-10 w-10 text-primary-400 animate-spin mb-3" />
        <span className="animate-pulse text-lg font-medium">Loading...</span>
      </div>
    );
  }

  return <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />;
}
