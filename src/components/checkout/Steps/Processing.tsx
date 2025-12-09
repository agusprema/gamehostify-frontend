"use client";

import React, { useCallback, useState } from "react";
import {
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Timer,
  RotateCcw,
  XCircle,
  CheckCircle2,
  Ban,
  CreditCard,
  BanknoteX,
} from "lucide-react";
import type {
  PaymentStatusPayload,
  PaymentQueueStatus,
} from "@/components/checkout/types/checkout";
import PaymentInstructions from "@/components/checkout/payment/PaymentInstructions";
import { apiFetch } from "@/lib/apiFetch";
import { useToast } from "@/components/ui/ToastProvider";

interface ProcessingProps {
  trackingId: string | null;
  status: PaymentStatusPayload | null;
}

type StatusMeta = {
  title: string;
  description: string;
  icon: React.ReactNode; // penting: ReactNode, bukan Element
};

const baseProcessing: StatusMeta = {
  title: "Sedang diproses",
  description: "Kami berkomunikasi dengan penyedia pembayaran untuk membuat/menyelesaikan invoice Anda.",
  icon: <Loader2 className="h-14 w-14 text-primary-500 animate-spin" aria-hidden="true" />,
};

const baseWaiting: StatusMeta = {
  title: "Menunggu Pembayaran",
  description: "Selesaikan pembayaran sesuai instruksi yang diberikan.",
  icon: <Timer className="h-14 w-14" aria-hidden="true" />,
};

const statusCopy = {
  // queue/pre-processing
  queued: {
    title: "Permintaan pembayaran diterima",
    description: "Kami sedang memproses permintaan pembayaran Anda. Mohon tunggu beberapa saat.",
    icon: <Loader2 className="h-14 w-14 text-primary-500 animate-spin" aria-hidden="true" />,
  },

  // processing-ish
  PROCESSING: baseProcessing,
  PENDING: baseProcessing,

  MANUAL_REVIEW: {
    title: "Tinjauan Manual",
    description: "Transaksi berisiko tinggi dan sedang ditinjau oleh tim support.",
    icon: <ShieldAlert className="h-14 w-14 text-amber-500" aria-hidden="true" />,
  },

  REQUIRES_ACTION: {
    title: "Butuh Tindakan",
    description: "Diperlukan aksi dari Anda.",
    icon: <AlertTriangle className="h-14 w-14 text-amber-500" aria-hidden="true" />,
  },

  WAITING_PAYMENT: baseWaiting,

  // payment flow states
  ACCEPTING_PAYMENTS: {
    title: "Menyiapkan Pembayaran",
    description: "Gateway siap menerima pembayaran Anda. Silakan lanjutkan sesuai instruksi.",
    icon: <CreditCard className="h-14 w-14" aria-hidden="true" />,
  },

  AUTHORIZED: {
    title: "Terotorisasi",
    description: "Pembayaran telah diotorisasi dan menunggu penyelesaian.",
    icon: <ShieldCheck className="h-14 w-14 text-emerald-500" aria-hidden="true" />,
  },

  // terminal-ish
  SUCCEEDED: {
    title: "Berhasil",
    description: "Pembayaran berhasil. Kami menyiapkan halaman invoice Anda…",
    icon: <CheckCircle2 className="h-14 w-14 text-emerald-500" aria-hidden="true" />,
  },

  FAILED: {
    title: "Gagal",
    description: "Terjadi kendala saat memproses pembayaran.",
    icon: <XCircle className="h-14 w-14 text-red-500" aria-hidden="true" />,
  },

  REFUND: {
    title: "Refund Diproses",
    description: "Dana akan dikembalikan sesuai kebijakan pembayaran.",
    icon: <RotateCcw className="h-14 w-14 text-primary-500" aria-hidden="true" />,
  },

  CANCELED: {
    title: "Dibatalkan",
    description: "Transaksi dibatalkan oleh pengguna atau sistem.",
    icon: <XCircle className="h-14 w-14 text-gray-500" aria-hidden="true" />,
  },

  EXPIRED: {
    title: "Kedaluwarsa",
    description: "Batas waktu pembayaran habis. Buat pesanan baru jika masih ingin melanjutkan.",
    icon: <AlertTriangle className="h-14 w-14 text-gray-500" aria-hidden="true" />,
  },

  INVALID: {
    title: "Tidak Valid",
    description: "Data pembayaran tidak valid. Periksa kembali input Anda.",
    icon: <Ban className="h-14 w-14 text-red-500" aria-hidden="true" />,
  },

  // fallback
  unknown: {
    title: "Memproses permintaan pembayaran",
    description: "Kami sedang memproses permintaan pembayaran Anda.",
    icon: <Loader2 className="h-14 w-14 text-primary-500 animate-spin" aria-hidden="true" />,
  },
} satisfies Record<PaymentQueueStatus | "unknown", StatusMeta>; // strict: semua key wajib ada

const Processing: React.FC<ProcessingProps> = React.memo(({ trackingId, status }) => {
  const currentStatus = (status?.status ?? (trackingId ? "queued" : "unknown")) as PaymentQueueStatus | "unknown";

  const copy: StatusMeta =
    statusCopy[currentStatus] ?? statusCopy.unknown!;

  const toast = useToast();
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const handleCancel = useCallback(async () => {
    if (!status?.reference_id || isCancelling) return;
    setIsCancelling(true);
    try {
      const cancelRes = await apiFetch(`api/v1/payment/cancel`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference_id: status.reference_id,
          cancellation_token: status.transaction?.cancellation_token,
        }),
      });

      if (!cancelRes.ok) {
        try {
          const data = await cancelRes.json();
          const apiMsg = data?.message || data?.error || "Gagal membatalkan transaksi.";
          throw new Error(apiMsg);
        } catch {
          throw new Error("Gagal membatalkan transaksi.");
        }
      }

      toast.success("Permintaan pembatalan dikirim. Memperbarui status…");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal membatalkan transaksi.";
      toast.error(msg);
    } finally {
      setIsCancelling(false);
    }
  }, [status?.reference_id, isCancelling, toast, status?.transaction?.cancellation_token]);

  return (
    <section
      className="bg-white dark:bg-gray-900/50 p-8 rounded-xl text-center text-gray-900 dark:text-white transition-colors duration-300"
      aria-labelledby="processing-heading"
    >
      <span className="sr-only" role="status" aria-live="polite">
        {copy.title} - {copy.description}
      </span>
      <div className="flex flex-col items-center gap-4">
        <div className="p-3 rounded-full bg-primary-500/10 dark:bg-primary-400/10">{copy.icon}</div>
        <h2 id="processing-heading" className="text-xl font-semibold">
          {copy.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-xl">{copy.description}</p>

        {status?.status === "REQUIRES_ACTION" && status?.transaction?.actions && status.transaction.actions.length > 0 && (
          <div className="mt-8 w-full max-w-2xl text-left">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white text-center">Instruksi Pembayaran</h3>
            <div className="mb-6">
              <PaymentInstructions actions={status.transaction.actions} channelCode={status.transaction.payment_method} />
            </div>
          </div>
        )}

        {trackingId && status?.status === "queued" && (
          <div className="mt-4 bg-gray-100 dark:bg-gray-800/60 rounded-lg px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
            <p className="font-medium text-gray-800 dark:text-gray-200">Tracking ID</p>
            <p className="font-mono text-xs sm:text-sm break-all">{trackingId}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" aria-hidden="true" />
              Berlaku hingga 60 menit sejak permintaan dibuat.
            </p>
          </div>
        )}

        {status?.reference_id && status?.status !== "queued" && (
          <div className="mt-4 bg-gray-100 dark:bg-gray-800/60 rounded-lg px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
            <p className="font-medium text-gray-800 dark:text-gray-200">Refrence ID</p>
            <p className="font-mono text-xs sm:text-sm break-all">{status?.reference_id}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" aria-hidden="true" />
              Berlaku hingga 60 menit sejak permintaan dibuat.
            </p>
          </div>
        )}

        {status?.message && (
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl">Keterangan: {status.message}</p>
        )}

        {status?.fraud_check_id && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Fraud Check ID: <span className="font-mono">{status.fraud_check_id}</span>
          </p>
        )}
        {status?.support_case_id && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Support Case ID: <span className="font-mono">{status.support_case_id}</span>
          </p>
        )}

        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 max-w-xl">
          Sistem akan memperbarui status secara otomatis menggunakan polling dengan jeda adaptif. Anda dapat menutup
          halaman setelah mendapatkan status final atau mengikuti instruksi yang diberikan pada halaman invoice.
        </div>

        {status?.status === "REQUIRES_ACTION" && status?.reference_id && (
          <div className="mt-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isCancelling}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-red-500/40 text-red-700 dark:text-red-300 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition disabled:opacity-50"
            >
              <BanknoteX className="h-4 w-4" aria-hidden="true" />
              {isCancelling ? "Membatalkan…" : "Batalkan Transaksi"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
});

Processing.displayName = "Processing";

export default Processing;
