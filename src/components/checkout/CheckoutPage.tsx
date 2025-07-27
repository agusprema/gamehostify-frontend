"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { ShoppingCart } from "lucide-react";

import StepIndicator from "@/components/checkout/Steps/StepIndicator";
import CustomerInfo from "@/components/checkout/Steps/CustomerInfo";
import PaymentMethod from "@/components/checkout/Steps/PaymentMethod";
import Processing from "@/components/checkout/Steps/Processing";
import Success from "@/components/checkout/Steps/Success";
import OrderSummary from "@/components/checkout/Summary/OrderSummary";
import Wrapper from "@/components/ui/Wrapper";
import Link from "../ui/Link";

import { useCheckoutState } from "./hooks/useCheckoutState";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const referenceId = searchParams.get("reference_id") ?? undefined;
  // Validasi status agar cocok dengan union type
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

  // Main content sesuai step
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

    // Return lebih awal jika cart kosong
    if (!items || items.length === 0) {
      return (
        <Wrapper className="py-10">
          <div className="max-w-xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
            <ShoppingCart className="h-20 w-20 text-primary-500 mb-6" />
            <h2 className="text-2xl font-bold mb-2 text-primary-600 dark:text-primary-400">Keranjang Kosong</h2>
            <p className="mb-6 text-gray-500 dark:text-gray-300">Belum ada produk yang ditambahkan ke keranjang.<br />Silakan pilih produk terlebih dahulu sebelum checkout.</p>
            <Link
              href="/"
              className="px-6 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold shadow transition"
            >
              Kembali ke Shop
            </Link>
          </div>
        </Wrapper>
      );
    }
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
    <Wrapper className="py-10">
      <main className="max-w-5xl mx-auto px-4" aria-labelledby="checkout-heading">
        {/* Header */}
        <header className="flex items-center justify-between mb-10 px-4 sm:px-6 lg:px-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-500/10 dark:bg-primary-400/10">
              <ShoppingCart className="w-6 h-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            </div>
            <h1 id="checkout-heading" className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Checkout
            </h1>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <section className="lg:col-span-2 space-y-6 rounded-xl p-6 border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md shadow-md" aria-label="Checkout Steps">
            <StepIndicator step={step} />
            {mainContent}
          </section>

          {/* Order Summary */}
          <aside className="sticky top-24 h-fit" aria-label="Ringkasan Pesanan">
            <OrderSummary
              items={items}
              total={total}
              selectedChannel={selectedChannel}
              paymentMethods={paymentMethods}
              isLoading={isInitialLoading}
            />
          </aside>
        </div>
      </main>
    </Wrapper>
  );
}
