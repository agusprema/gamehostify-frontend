"use client";

import React from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock
} from "lucide-react";
import { CartItem } from "@/components/checkout/types/checkout";

interface Props {
  orderId: string;
  items: CartItem[];
  status?: "success" | "cancel" | "failed" | "expired";
}

const Success: React.FC<Props> = React.memo(({ orderId, items, status = "success" }) => {
  let icon = <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" aria-hidden="true" />;
  let title = "Payment Successful!";
  let message = "Your order has been processed successfully.";
  let textColor = "text-gray-600 dark:text-gray-400";
  let orderNote =
    items.length > 0
      ? "Game credits will be delivered to your account soon."
      : "You will receive a confirmation email shortly.";

  if (status === "cancel") {
    icon = <XCircle className="h-16 w-16 text-yellow-500 mx-auto mb-6" aria-hidden="true" />;
    title = "Payment Cancelled";
    message = "You cancelled the payment process.";
    orderNote = "You can try again or choose another payment method.";
  } else if (status === "failed") {
    icon = <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" aria-hidden="true" />;
    title = "Payment Failed";
    message = "We couldn’t process your payment.";
    orderNote = "Please check your payment method or try again.";
  } else if (status === "expired") {
    icon = <Clock className="h-16 w-16 text-orange-500 mx-auto mb-6" aria-hidden="true" />;
    title = "Payment Expired";
    message = "The payment session has expired.";
    orderNote = "Please start a new transaction.";
  }

  return (
    <section className="bg-gray-100 dark:bg-gray-900/50 rounded-xl p-12 text-center" aria-labelledby="success-heading">
      {/* Live region for screen readers */}
      <span className="sr-only" role="status" aria-live="polite">{title} - {message}</span>
      {icon}
      <h2 id="success-heading" className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h2>
      <p className={`${textColor} mb-6`}>{message}</p>

      <div className="bg-gray-200 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Invoice ID:</p>
        <p className="text-lg font-mono text-primary-600 dark:text-primary-400">{orderId}</p>
      </div>

      <p className={`${textColor} mb-6`}>{orderNote}</p>

      <a
        href="/"
        className="inline-block cursor-pointer bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
        aria-label="Continue Shopping"
        tabIndex={0}
        role="button"
      >
        Continue Shopping
      </a>
    </section>
  );
});

export default Success;
