"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Group, LoaderCircle, X } from "lucide-react";
import { CartItem, PaymentMethodsMap } from "@/components/checkout/types/checkout";
import Image from "next/image";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

interface Props {
  items: CartItem[];
  total: number;
  save_amount:number;
  selectedChannel: string;
  paymentMethods: PaymentMethodsMap;
  isLoading?: boolean;
  onSubmit: (id: string, shouldDelete: boolean) => void;
  couponError: string | null;
  code: string | null;
  isLoadingCode: boolean;
}

const OrderSummary: React.FC<Props> = React.memo(({
  onSubmit,
  items,
  total,
  save_amount,
  selectedChannel,
  paymentMethods,
  isLoading = false,
  couponError = null,
  code = null,
  isLoadingCode = false
}) => {
  const [couponCode, setCouponCode] = useState<string | null>(null);

  // Normal content jika data sudah ready
  const selectedChannelObj = useMemo(() => {
    const all = Object.values(paymentMethods).flat();
    return all.find((c) => c.code === selectedChannel);
  }, [paymentMethods, selectedChannel]);

  const { fee, feeType, feeValue, grandTotal } = useMemo(() => {
    const feeValue = Number(selectedChannelObj?.fee_value || 0);
    const feeType = selectedChannelObj?.fee_type || "fixed";
    const fee = feeType === "percentage" ? (total * feeValue) / 100 : feeValue;
    const grandTotal = total + fee;
    return { fee, feeType, feeValue, grandTotal };
  }, [selectedChannelObj, total]);

  const handleSubmit = useCallback(() => {
    if (!couponCode || !couponCode.trim()) return;
    onSubmit(couponCode.trim(), false);
  }, [couponCode, onSubmit]);

  const handleRemove = useCallback(() => {
    onSubmit('', true);
  }, [onSubmit]);

  useEffect(() => {
    setCouponCode(code);
  }, [code]);

  if (isLoading) {
    return (
      <Card className="sticky top-24" aria-labelledby="order-summary-heading">
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
      </Card>
    );
  }

  return (
    <Card className="sticky top-24" aria-labelledby="order-summary-heading">
      <h2 id="order-summary-heading" className="text-xl text-gray-900 dark:text-white mb-6 flex items-center">
        <Group className="h-6 w-6 mr-2 text-yellow-500" aria-hidden="true" />
        Order Summary
      </h2>

      <ul className="space-y-4 mb-6">
        {items.map((item, idx) => (
          <li
            key={idx}
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
                
                {
                  item.packages.discount_applied && (
                    <span className="line-through text-sm text-gray-500 mr-2">
                      Rp {(item.subtotal + item.packages.discount_applied.amount_saved).toLocaleString("id-ID")}
                    </span>
                  )
                }
                <span className="text-base font-semibold">
                  Rp {item.subtotal.toLocaleString("id-ID")}
                </span>

              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
        <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Coupon Code
        </label>
        <div className="flex flex-col sm:flex-row gap-2">

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              type="text"
              id="coupon"
              name="coupon"
              placeholder="e.g. DISCOUNT10"
              value={couponCode ?? ''}
              onChange={(e) => setCouponCode(e.target.value)}
              className="text-sm"
            />
            <X className={`h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-red-500 ${!couponCode || !couponCode.trim() ? 'hidden': ''}`}
               onClick={() => {
                  setCouponCode('');
                  handleRemove();
                }}
            />
          </div>

          {/* button ini keluar dari container */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={couponCode === code || !couponCode || !couponCode.trim()}
            className="sm:w-auto w-full cursor-pointer px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            
            {isLoadingCode ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <>Apply</>
            )}
          </button>
        </div>
        {couponError && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{couponError}</p>
        )}

      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-700 dark:text-gray-400">
          <span>Subtotal</span>
          <span className="text-gray-900 dark:text-white">Rp{total.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between text-sm text-red-700 dark:text-red-400">
          <span>Discount</span>
          <span className="">
            - Rp{save_amount.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-700 dark:text-gray-400">
          <span>Tax</span>
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
    </Card>
  );
});

OrderSummary.displayName = "OrderSummary";

export default OrderSummary;
