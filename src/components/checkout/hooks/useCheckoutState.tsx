"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { getCartToken } from "@/lib/cart/getCartToken";
import { apiFetch } from "@/lib/apiFetch";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import type {
  CheckoutStep,
  CustomerFormValues,
  PaymentMethodsMap,
  PaymentStatusPayload,
} from "../types/checkout";
import { buildErrorObjects, updateNestedProps } from "../utils/checkout";
import logger from "@/lib/logger";
import { useToast } from "@/components/ui/ToastProvider";

interface UseCheckoutStateOpts {
  initialStatus?: "SUCCEEDED" | "CANCELED" | "FAILED" | "EXPIRED";
  initialReferenceId?: string;
}

/** Hook utama untuk seluruh alur checkout. */
export function useCheckoutState(opts: UseCheckoutStateOpts = {}) {
  const { initialStatus, initialReferenceId } = opts;
  const { cart, fetchCart } = useCart();
  const router = useRouter();
  const { authenticated } = useAuthStatus();
  const toast = useToast();

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
  const [orderId, setOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState<"SUCCEEDED" | "CANCELED" | "FAILED" | "EXPIRED">("SUCCEEDED");
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusPayload | null>(null);

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
              const res = await apiFetch(
                'api/v1/payment/methods',
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
                toast.error("Gagal memuat metode pembayaran. Silakan coba lagi.");
              }
            } catch (err) {
              logger.error("Failed to load payment methods", err);
              if (!cancelled) toast.error("Gagal memuat metode pembayaran. Silakan cek koneksi Anda.");
            } finally {
              if (!cancelled) setLoadingPaymentMethods(false);
            }
          })(),
          (async () => {
            try {
              await fetchCart();
            } catch (err) {
              logger.error("Failed to load cart", err);
              if (!cancelled) toast.error("Gagal memuat keranjang. Silakan refresh halaman.");
            } finally {
              if (!cancelled) setLoadingCart(false);
            }
          })(),
        ]);
      } catch (err) {
        logger.error("Initial load error", err);
        toast.error("Terjadi kesalahan saat inisialisasi checkout. Silakan refresh halaman.");
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
    setChannelServerErrors({});
    setCustomerServerErrors({});
    setIsPaying(false);
    setStep("payment");
    setTrackingId(null);
    setPaymentStatus(null);
  }, []);

  const handlePayment = useCallback(async () => {
    setStep("loadingPay");
    setIsPaying(true);
    setCustomerServerErrors({});
    setChannelServerErrors({});
    setTrackingId(null);
    setPaymentStatus(null);

    try {
      const cartToken = await getCartToken();
      if (!cartToken) throw new Error("Cart token missing");

      const res = await apiFetch(
        'api/v1/payment/invoice',
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Cart-Token": cartToken,
          },
          body: JSON.stringify((() => {
            const payload: Record<string, unknown> = {
              cart_token: cartToken,
              channel_code: selectedChannel,
              channel_properties: channelProperties,
              coupon_code: code ?? null,
            };
            if (!authenticated) {
              payload.customer = {
                name: customerInfo.name,
                email: customerInfo.email,
                phone_number: customerInfo.phone,
              };
            }
            return payload;
          })()),
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
        const newTrackingId = json.data?.tracking_id as string | undefined;
        if (!newTrackingId) {
          throw new Error("Tracking ID missing in response");
        }
        setTrackingId(newTrackingId);
        setPaymentStatus({
          status: "queued",
          tracking_id: newTrackingId,
          queued: Boolean(json.data?.queued),
        });
        setOrderId(null);
        setStep("processing");
      }else {
        toast.error("Pembayaran gagal. Silakan coba lagi.");
        setStep("payment");
      }
    } catch (err) {
      logger.error(err);
      toast.error("Terjadi kesalahan pembayaran, coba lagi.");
      setStep("payment");
    } finally {
      setIsPaying(false);
    }
  }, [toast, selectedChannel, customerInfo, channelProperties, authenticated, code]);

  useEffect(() => {
    if (!trackingId) return;

    let cancelled = false;
    let attempt = 0;
    const baseDelay = 3000;
    const maxDelay = 15000;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const scheduleNext = () => {
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      attempt += 1;
      timeoutId = setTimeout(pollStatus, delay);
    };

    const handleFinalStateCleanup = () => {
      setTrackingId(null);
      attempt = 0;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    };

    const pollStatus = async () => {
      try {
        const res = await apiFetch(`api/v1/payment/status/${trackingId}`, {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        const json = await res.json();

        if (cancelled) return;

        if (res.status === 400 || res.status === 404) {
          handleFinalStateCleanup();
          toast.error(
            "Tracking pembayaran tidak ditemukan atau sudah kedaluwarsa. Silakan kirim ulang permintaan pembayaran."
          );
          setStep("payment");
          return;
        }

        if (!res.ok || json?.status !== "success" || !json?.data) {
          throw new Error("Invalid status response");
        }

        const data = json.data as PaymentStatusPayload;

        setPaymentStatus((prev) => {
          if (prev?.status !== data.status && data.status === "MANUAL_REVIEW") {
            toast.info(
              "Transaksi membutuhkan review manual. Tim kami akan menghubungi Anda jika diperlukan."
            );
          }
          return data;
        });

        switch (data.status) {
          case "queued":
          case "PROCESSING": {
            scheduleNext();
            break;
          }
          case "REQUIRES_ACTION": {
            // Keep showing processing step with instructions; continue polling until success/failure
            setStep("processing");
            scheduleNext();
            break;
          }
          case "MANUAL_REVIEW": {
            handleFinalStateCleanup();
            setStep("processing");
            break;
          }
          case "SUCCEEDED": {
            handleFinalStateCleanup();
            setStep("success");
            if (data.reference_id) {
              setOrderId(data.reference_id);
              setStatus("SUCCEEDED");
              router.push(`/invoice?ref=${encodeURIComponent(data.reference_id)}`);
            } else {
              toast.success("Permintaan pembayaran berhasil diproses.");
            }
            break;
          }
          case "INVALID": {
            handleFinalStateCleanup();
            const errors = (data.errors ?? {}) as Record<string, string[] | string>;
            const { customer, channel, hasCustomerErr, hasChannelErr } = buildErrorObjects(errors);
            setCustomerServerErrors(customer);
            setChannelServerErrors(channel);
            toast.error(data.message ?? "Data pembayaran tidak valid. Mohon periksa kembali.");
            if (hasCustomerErr) setStep("info");
            else if (hasChannelErr) setStep("payment");
            else setStep("payment");
            break;
          }
          case "FAILED": {
            handleFinalStateCleanup();
            toast.error(data.message ?? "Pembayaran gagal diproses. Silakan coba lagi.");
            setStep("payment");
            break;
          }
          case "CANCELED": {
            handleFinalStateCleanup();
            // Tampilkan halaman ringkasan dengan status dibatalkan
            setStep("success");
            if (data.reference_id) {
              setOrderId(data.reference_id);
            }
            setStatus("CANCELED");
            break;
          }
          default: {
            scheduleNext();
          }
        }
      } catch (err) {
        if (cancelled) return;
        logger.error("Payment status polling error", err);
        scheduleNext();
      }
    };

    pollStatus();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [trackingId, toast, router]);

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
      status,
      trackingId,
      paymentStatus,
    }),
    [
      step,
      xenditMessage,
      customerInfo,
      paymentMethods,
      selectedMethod,
      selectedChannel,
      channelProperties,
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
      status,
      trackingId,
      paymentStatus,
    ]
  );
}
