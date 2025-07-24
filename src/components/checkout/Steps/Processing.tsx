"use client";

import React from "react";
import WaitingForPayment from "@/components/checkout/payment/WaitingForPayment";
import { CheckoutTransaction } from "@/components/checkout/types/checkout";

interface ProcessingProps {
  transaction: CheckoutTransaction;
  onPaid: () => void;
}

export default function Processing({ transaction, onPaid }: ProcessingProps) {
  return (
    <div className="bg-white dark:bg-gray-900/50 p-8 rounded-xl text-center text-gray-900 dark:text-white transition-colors duration-300">
      <WaitingForPayment transaction={transaction} onPaid={onPaid} />
    </div>
  );
}
