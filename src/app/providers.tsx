'use client';

import { ReactNode } from 'react';
import { LoaderProvider } from '@/contexts/LoaderContext';
import { CartProvider } from '@/contexts/CartContext';
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LoaderProvider>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </LoaderProvider>
  );
}
