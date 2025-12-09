"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getCartToken } from '@/lib/cart/getCartToken';

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

  // Avoid rendering markup during SSR hydration to prevent mismatch
  if (!mounted) return null;

  return <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />;
}
