"use client";
import React from "react";
import { X, ShoppingBag } from "lucide-react";

interface CartHeaderProps {
  quantity: number;
  onClose: () => void;
}

const CartHeader = React.memo(function CartHeader({ quantity, onClose }: CartHeaderProps) {
  return (
    <header className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800/50 transition-colors" aria-labelledby="cart-heading">
      <h2 id="cart-heading" className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
        <ShoppingBag className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
        Cart <span className="text-primary-600 dark:text-primary-400">({quantity})</span>
      </h2>
      <button
        onClick={onClose}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/70 transition cursor-pointer"
        aria-label="Close cart"
      >
        <X className="h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
      </button>
    </header>
  );
});

export default CartHeader;
