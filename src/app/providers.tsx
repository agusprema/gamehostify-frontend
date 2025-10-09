'use client';

import { ReactNode } from 'react';
import { LoaderProvider } from '@/contexts/LoaderContext';
import { CartProvider } from '@/contexts/CartContext';
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/ToastProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LoaderProvider>
      <ThemeProvider>
        <CartProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </CartProvider>
      </ThemeProvider>
    </LoaderProvider>
  );
}
