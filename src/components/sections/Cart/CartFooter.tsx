"use client";
import React from "react";
import { CreditCard } from "lucide-react";
import Link from "@/components/ui/Link";

interface CartFooterProps {
  totalFormatted: string;
  onCheckout: () => void;
}

const CartFooter = React.memo(function CartFooter({ totalFormatted, onCheckout }: CartFooterProps) {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700/70 p-6 bg-white dark:bg-gray-900/60 backdrop-blur-sm transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-800 dark:text-white text-lg">Total:</span>
        <span className="text-primary-600 dark:text-primary-400 font-bold text-xl">{totalFormatted}</span>
      </div>
      <Link
        href="/checkout"
        onNavigateStart={onCheckout}
        className="
          w-full flex items-center justify-center gap-2
          py-3 rounded-lg font-semibold text-white
          bg-gradient-to-r from-primary-500 to-primary-600
          hover:from-primary-600 hover:to-primary-700
          transition-transform hover:scale-[1.02]
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer
        "
      >
        <CreditCard className="h-5 w-5" />
        Checkout
      </Link>
    </footer>
  );
});

export default CartFooter;
