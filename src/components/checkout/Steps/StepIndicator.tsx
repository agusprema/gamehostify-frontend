import { Loader2 } from "lucide-react";
import React from "react";
import { CheckoutStep } from "@/components/checkout/types/checkout";

interface Props {
  step: CheckoutStep;
}

function StepIndicator({ step }: Props) {
  const active = (s: CheckoutStep | string) => {
    if (step === "loading") return false;
    return (
      (s === "info" && ["info", "payment", "processing", "success"].includes(step)) ||
      (s === "payment" && ["payment", "processing", "success"].includes(step)) ||
      (s === "success" && ["success"].includes(step))
    );
  };

  if (step === "loading") {
    return (
      <div className="flex flex-col items-center justify-center mb-12 space-y-4 py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500 drop-shadow-lg" />
        <p className="text-lg font-semibold text-primary-400 animate-pulse">
          Loading Checkout…
        </p>
        <span className="text-sm text-gray-600 dark:text-gray-400">Please wait a moment</span>
      </div>
    );
  }

  if (step === "loadingPay") {
    return (
      <div className="flex flex-col items-center justify-center mb-12 space-y-4 py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500 drop-shadow-lg" />
        <p className="text-lg font-semibold text-primary-400 animate-pulse">
          Processing Payment…
        </p>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Please wait while we confirm your transaction
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center mb-12">
      <div className="flex items-center space-x-4">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full ${
            active("info") ? "bg-primary-500" : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          <span className="font-semibold text-gray-900 dark:text-white">1</span>
        </div>
        <div
          className={`w-16 h-1 ${
            active("payment") ? "bg-primary-500" : "bg-gray-200 dark:bg-gray-700"
          }`}
        />
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full ${
            active("payment") ? "bg-primary-500" : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          <span className="font-semibold text-gray-900 dark:text-white">2</span>
        </div>
        <div
          className={`w-16 h-1 ${
            active("success") ? "bg-primary-500" : "bg-gray-200 dark:bg-gray-700"
          }`}
        />
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full ${
            active("success") ? "bg-primary-500" : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          <span className="font-semibold text-gray-900 dark:text-white">3</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(StepIndicator);
