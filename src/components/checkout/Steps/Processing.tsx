"use client";

import React from "react";
import WaitingForPayment from "@/components/checkout/payment/WaitingForPayment";
import { CheckoutTransaction } from "@/components/checkout/types/checkout";

interface ProcessingProps {
  transaction: CheckoutTransaction;
  onPaid: () => void;
}

const Processing: React.FC<ProcessingProps> = React.memo(({ transaction, onPaid }) => {
  return (
    <section className="bg-white dark:bg-gray-900/50 p-8 rounded-xl text-center text-gray-900 dark:text-white transition-colors duration-300" aria-labelledby="processing-heading">
      <h2 id="processing-heading" className="text-xl font-bold mb-6">Waiting for Payment</h2>
      <WaitingForPayment transaction={transaction} onPaid={onPaid} />
    </section>
  );
});

export default Processing;
