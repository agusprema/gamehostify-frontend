"use client";

import React from "react";
import { Group } from "lucide-react";
import { CartItem, PaymentMethodsMap } from "@/components/checkout/types/checkout";
import Image from "next/image";

interface Props {
  items: CartItem[]; // ✅ harus array
  total: number;
  selectedChannel: string;
  paymentMethods: PaymentMethodsMap;
  isLoading?: boolean;
}

const OrderSummary: React.FC<Props> = React.memo(({
  items,
  total,
  selectedChannel,
  paymentMethods,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <aside className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-md rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-md sticky top-24" aria-labelledby="order-summary-heading">
        <h2 id="order-summary-heading" className="text-xl text-gray-900 dark:text-white mb-6 flex items-center">
          <Group className="h-6 w-6 mr-2 text-yellow-500" aria-hidden="true" />
          Order Summary
        </h2>

        {/* Skeleton Loader */}
        <div className="space-y-4 mb-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 animate-pulse"
            >
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-md" />
              <div className="flex-1 space-y-2">
                <div className="w-2/3 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="w-1/3 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
          <div className="w-full h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
          <div className="w-full h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
          <div className="w-2/3 h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </aside>
    );
  }

  // Normal content jika data sudah ready
  const selectedChannelObj = Object.values(paymentMethods)
    .flat()
    .find((c) => c.code === selectedChannel);

  const feeValue = Number(selectedChannelObj?.fee_value || 0); // ✅ pastikan number
  const feeType = selectedChannelObj?.fee_type || "fixed";
  const fee = feeType === "percentage" ? (total * feeValue) / 100 : feeValue;
  const grandTotal = total + fee;

  return (
    <aside className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-md rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-md sticky top-24" aria-labelledby="order-summary-heading">
      <h2 id="order-summary-heading" className="text-xl text-gray-900 dark:text-white mb-6 flex items-center">
        <Group className="h-6 w-6 mr-2 text-yellow-500" aria-hidden="true" />
        Order Summary
      </h2>

      <ul className="space-y-4 mb-6">
        {items.map((item) => (
          <li
            key={item.name}
            className="flex items-center gap-4 bg-white/50 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-4"
          >
            <Image
              src={item.image}
              alt={item.name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-md"
            />
            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-white">{item.name}</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs">Qty: {item.quantity}</p>
              <p className="text-primary-600 dark:text-primary-400 font-semibold">
                Rp{item.subtotal.toLocaleString("id-ID")}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-700 dark:text-gray-400">
          <span>Subtotal</span>
          <span className="text-gray-900 dark:text-white">Rp{total.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-700 dark:text-gray-400">
          <span>Fee</span>
          <span className="text-gray-900 dark:text-white">
            Rp{fee.toLocaleString("id-ID")} {feeType === "percentage" && `(${feeValue}%)`}
          </span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 dark:text-white text-lg">
          <span>Total</span>
          <span className="text-primary-600 dark:text-primary-400">
            Rp{grandTotal.toLocaleString("id-ID")}
          </span>
        </div>
      </div>
    </aside>
  );
});

export default OrderSummary;
