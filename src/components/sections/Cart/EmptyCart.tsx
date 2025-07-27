"use client";
import React from "react";
import { ShoppingBag } from "lucide-react";

const EmptyCart = React.memo(function EmptyCart() {
  return (
    <div className="text-center py-12" role="status" aria-live="polite">
      <ShoppingBag className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" aria-hidden="true" />
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
        Your cart is empty
      </h3>
      <p className="text-gray-500 dark:text-gray-500 text-sm">
        Add some products to get started!
      </p>
    </div>
  );
});

export default EmptyCart;
