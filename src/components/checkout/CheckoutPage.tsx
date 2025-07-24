"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import StepIndicator from "@/components/checkout/Steps/StepIndicator";
import CustomerInfo from "@/components/checkout/Steps/CustomerInfo";
import PaymentMethod from "@/components/checkout/Steps/PaymentMethod";
import Processing from "@/components/checkout/Steps/Processing";
import Success from "@/components/checkout/Steps/Success";
import OrderSummary from "@/components/checkout/Summary/OrderSummary";
import Wrapper from "@/components/ui/Wrapper";

import { useCheckoutState } from "./hooks/useCheckoutState";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const referenceId = searchParams.get("reference_id") ?? undefined;

  // ✅ Validasi status agar cocok dengan union type
  const rawStatus = searchParams.get("status");
  const statusas = ["success", "cancel", "failed", "expired"].includes(rawStatus || "")
    ? (rawStatus as "success" | "cancel" | "failed" | "expired")
    : undefined;

  const {
    step,
    customerInfo,
    paymentMethods,
    selectedChannel,
    setSelectedMethod,
    setSelectedChannel,
    channelProperties,
    isPaying,
    customerServerErrors,
    channelServerErrors,
    isInitialLoading,
    items,
    total,
    transaction,
    orderId,
    status,
    handleCustomerInfoSubmit,
    handleChannelPropertyChange,
    handlePayment,
    setStep,
  } = useCheckoutState({
    initialReferenceId: referenceId,
    initialStatus: statusas,
  });

  let mainContent: React.ReactNode = null;

  if (step === "info") {
    mainContent = (
      <CustomerInfo
        items={items}
        defaultValues={customerInfo}
        onSubmit={handleCustomerInfoSubmit}
        serverErrors={customerServerErrors}
      />
    );
  } else if (step === "payment") {
    mainContent = (
      <PaymentMethod
        paymentMethods={paymentMethods}
        selectedChannel={selectedChannel}
        setSelectedMethod={setSelectedMethod}
        setSelectedChannel={setSelectedChannel}
        channelProperties={channelProperties}
        handleChannelPropertyChange={handleChannelPropertyChange}
        serverErrors={channelServerErrors}
        isPaying={isPaying}
        onBack={() => setStep("info")}
        onSubmitPayment={handlePayment}
        total={total}
      />
    );
  } else if (step === "processing" && transaction) {
    mainContent = (
      <Processing transaction={transaction} onPaid={() => setStep("success")} />
    );
  } else if (step === "success") {
    mainContent = (
      <Success
        orderId={orderId ?? ""}
        items={items}
        status={status}
      />
    );
  }

  return (
    <Wrapper>
      <div className="max-w-5xl mx-auto px-4 mb-10">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => history.back()}
            className="flex items-center text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Shop
          </button>
          <h1 className="ml-4 text-3xl font-bold text-white">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6 rounded-xl p-6 border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md shadow-md">
            <StepIndicator step={step} />
            {mainContent}
          </div>

          {/* Order Summary */}
          <div className="sticky top-24 h-fit">
            <OrderSummary
              items={items}
              total={total}
              selectedChannel={selectedChannel}
              paymentMethods={paymentMethods}
              isLoading={isInitialLoading}
            />
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
