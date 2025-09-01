"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { ensureCartToken } from "@/lib/cart/getCartToken";
import type {
  CheckoutStep,
  CustomerFormValues,
  PaymentMethodsMap,
  CheckoutTransaction,
} from "../types/checkout";
import { buildErrorObjects, updateNestedProps } from "../utils/checkout";

interface UseCheckoutStateOpts {
  initialStatus?: "success" | "cancel" | "failed" | "expired";
  initialReferenceId?: string;
}

/** Hook utama untuk seluruh alur checkout. */
export function useCheckoutState(opts: UseCheckoutStateOpts = {}) {
  const { initialStatus, initialReferenceId } = opts;
  const { cart, fetchCart } = useCart();
  const router = useRouter();

  // ---------------------------- State ----------------------------
  const [step, setStep] = useState<CheckoutStep>("loading");
  const [xenditMessage, setxenditMessage] = useState<string | null>(null);
  
  const [customerInfo, setCustomerInfo] = useState<CustomerFormValues>({
    name: "",
    email: "",
    phone: "",
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsMap>({});
  const [selectedMethod, setSelectedMethod] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");
  const [channelProperties, setChannelProperties] = useState<Record<string, unknown>>({});
  const [transaction, setTransaction] = useState<CheckoutTransaction | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState<"success" | "cancel" | "failed" | "expired">("success");

  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  const [loadingCart, setLoadingCart] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  const [customerServerErrors, setCustomerServerErrors] = useState<
    Partial<Record<keyof CustomerFormValues, string>>
  >({});
  const [channelServerErrors, setChannelServerErrors] = useState<Record<string, string>>({});

  // ---------------------------- Derived ----------------------------
  const isInitialLoading = loadingPaymentMethods || loadingCart;
  const items = useMemo(() => cart?.items ?? [], [cart?.items]);
  const total = useMemo(() => cart?.total ?? 0, [cart?.total]);
  const code = useMemo(() => cart?.code ?? null, [cart?.code]);
  const save_amount = useMemo(() => cart?.save_amount ?? 0, [cart?.save_amount]);

  // ---------------------------- Init (once) ----------------------------
  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      // Handle redirect dari payment gateway
      if (initialStatus && initialReferenceId) {
        setTransaction(null);
        setOrderId(initialReferenceId);
        setStatus(initialStatus);
        setStep("success");

        // Bersihkan query param di URL (tidak wajib; boleh dihapus)
        router.replace("/checkout");
        return;
      }

      try {
        await Promise.all([
          (async () => {
            try {
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1/payment/methods`,
                { headers: { Accept: "application/json" } }
              );
              const json = await res.json();
              if (!cancelled && json.status === "success") {
                const data: PaymentMethodsMap = json.data;
                setPaymentMethods(data);

                const categories = Object.keys(data);
                if (categories.length > 0) {
                  const defaultCategory = categories[0];
                  const channels = data[defaultCategory];
                  if (channels && channels.length > 0) {
                    setSelectedMethod(defaultCategory);
                    setSelectedChannel(channels[0].code);
                  }
                }
              } else if (!cancelled) {
                // Show error to user (replace with toast if available)
                alert("Gagal memuat metode pembayaran. Silakan coba lagi.");
              }
            } catch (err) {
              console.error("Failed to load payment methods", err);
              if (!cancelled) alert("Gagal memuat metode pembayaran. Silakan cek koneksi Anda.");
            } finally {
              if (!cancelled) setLoadingPaymentMethods(false);
            }
          })(),
          (async () => {
            try {
              await fetchCart();
            } catch (err) {
              console.error("Failed to load cart", err);
              if (!cancelled) alert("Gagal memuat keranjang. Silakan refresh halaman.");
            } finally {
              if (!cancelled) setLoadingCart(false);
            }
          })(),
        ]);
      } catch (err) {
        console.error("Initial load error", err);
        alert("Terjadi kesalahan saat inisialisasi checkout. Silakan refresh halaman.");
      }
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // hanya sekali; tidak tergantung searchParams lagi

  // ---------------------------- Set step ke info jika loading selesai ----------------------------
  useEffect(() => {
    if (!isInitialLoading && step === "loading") {
      setStep("info");
    }
  }, [isInitialLoading, step]);

  // ---------------------------- Handlers ----------------------------
  const handleChannelPropertyChange = useCallback((fullKey: string, value: string) => {
    setChannelProperties((prev) => updateNestedProps(prev, fullKey, value));
  }, []);

  const handleCustomerInfoSubmit = useCallback((data: CustomerFormValues) => {
    setCustomerInfo(data);
    setCustomerServerErrors({});
    setStep("payment");
  }, []);

  const resetForNewPayment = useCallback(() => {
    setxenditMessage(null);
    setTransaction(null);
    setChannelServerErrors({});
    setCustomerServerErrors({});
    setIsPaying(false);
    setStep("payment");
  }, []);

  const handlePayment = useCallback(async () => {
    setStep("loadingPay");
    setIsPaying(true);
    setCustomerServerErrors({});
    setChannelServerErrors({});

    try {
      const cartToken = await ensureCartToken();
      if (!cartToken) throw new Error("Cart token missing");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1/payment/invoice`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Cart-Token": cartToken,
          },
          body: JSON.stringify({
            cart_token: cartToken,
            payment_method: selectedMethod,
            channel_code: selectedChannel,
            customer: {
              name: customerInfo.name,
              email: customerInfo.email,
              phone_number: customerInfo.phone,
            },
            channel_properties: channelProperties,
          }),
        }
      );

      const json = await res.json();

      if (res.status === 422 && json?.errors) {
        const { customer, channel, hasCustomerErr, hasChannelErr } = buildErrorObjects(json.errors);
        setCustomerServerErrors(customer);
        setChannelServerErrors(channel);
        if (hasCustomerErr) setStep("info");
        else if (hasChannelErr) setStep("payment");
        else setStep("payment");
        return;
      }

      if (json.status === "success") {
        setTransaction(json.data);
        setOrderId(json.data.reference_id);
        setStep("processing");
      } else {
        alert("Payment failed. Please try again.");
        setStep("payment");
      }
    } catch (err) {
      console.error(err);
      alert("Payment error, try again.");
      setStep("payment");
    } finally {
      setIsPaying(false);
    }
  }, [selectedMethod, selectedChannel, customerInfo, channelProperties]);

  // ---------------------------- Memo API ----------------------------
  return useMemo(
    () => ({
      step,
      setStep,
      xenditMessage,
      customerInfo,
      paymentMethods,
      selectedMethod,
      setSelectedMethod,
      selectedChannel,
      setSelectedChannel,
      channelProperties,
      transaction,
      orderId,
      isPaying,
      customerServerErrors,
      channelServerErrors,
      isInitialLoading,
      items,
      code,
      total,
      save_amount,
      handleCustomerInfoSubmit,
      handleChannelPropertyChange,
      handlePayment,
      resetForNewPayment,
      status
    }),
    [
      step,
      xenditMessage,
      customerInfo,
      paymentMethods,
      selectedMethod,
      selectedChannel,
      channelProperties,
      transaction,
      orderId,
      isPaying,
      customerServerErrors,
      channelServerErrors,
      isInitialLoading,
      items,
      code,
      total,
      save_amount,
      handleCustomerInfoSubmit,
      handleChannelPropertyChange,
      handlePayment,
      resetForNewPayment,
      status
    ]
  );
}
