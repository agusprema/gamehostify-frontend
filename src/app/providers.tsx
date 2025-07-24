'use client';

import { ReactNode } from 'react';
import { LoaderProvider } from '@/contexts/LoaderContext';
import { CartProvider } from '@/contexts/CartContext';
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LoaderProvider>
      <ThemeProvider>
        <CartProvider>
        {children}
        </CartProvider>
      </ThemeProvider>
    </LoaderProvider>
  );
}
