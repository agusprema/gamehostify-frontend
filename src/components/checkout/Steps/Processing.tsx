"use client";

import React from "react";
import { Loader2, ShieldAlert, Info, Clock } from "lucide-react";
import type { PaymentStatusPayload, PaymentQueueStatus } from "@/components/checkout/types/checkout";

interface ProcessingProps {
  trackingId: string | null;
  status: PaymentStatusPayload | null;
}

const statusCopy: Record<PaymentQueueStatus | "unknown", { title: string; description: string; icon: React.ReactNode }> = {
  queued: {
    title: "Permintaan pembayaran diterima",
    description: "Kami sedang memproses permintaan pembayaran Anda. Mohon tunggu beberapa saat.",
    icon: <Loader2 className="h-14 w-14 text-primary-500 animate-spin" aria-hidden="true" />, 
  },
  processing: {
    title: "Sedang memproses dengan penyedia pembayaran",
    description: "Kami berkomunikasi dengan penyedia pembayaran untuk membuat invoice Anda.",
    icon: <Loader2 className="h-14 w-14 text-primary-500 animate-spin" aria-hidden="true" />, 
  },
  manual_review: {
    title: "Transaksi membutuhkan review manual",
    description:
      "Transaksi Anda terdeteksi memiliki risiko tinggi dan sedang ditinjau oleh tim support kami.",
    icon: <ShieldAlert className="h-14 w-14 text-amber-500" aria-hidden="true" />, 
  },
  success: {
    title: "Permintaan pembayaran berhasil",
    description: "Kami sedang menyiapkan halaman invoice Anda…",
    icon: <Loader2 className="h-14 w-14 text-primary-500 animate-spin" aria-hidden="true" />, 
  },
  invalid: {
    title: "Data pembayaran tidak valid",
    description: "Silakan kembali dan periksa kembali data yang dimasukkan.",
    icon: <Info className="h-14 w-14 text-red-500" aria-hidden="true" />, 
  },
  failed: {
    title: "Gagal memproses pembayaran",
    description: "Terjadi kendala saat membuat permintaan pembayaran.",
    icon: <Info className="h-14 w-14 text-red-500" aria-hidden="true" />, 
  },
  unknown: {
    title: "Memproses permintaan pembayaran",
    description: "Kami sedang memproses permintaan pembayaran Anda.",
    icon: <Loader2 className="h-14 w-14 text-primary-500 animate-spin" aria-hidden="true" />, 
  },
};

const statusLabel = (status?: PaymentQueueStatus): string => {
  switch (status) {
    case "queued":
      return "Queued";
    case "processing":
      return "Processing";
    case "manual_review":
      return "Manual Review";
    case "success":
      return "Success";
    case "invalid":
      return "Invalid";
    case "failed":
      return "Failed";
    default:
      return "Unknown";
  }
};

const Processing: React.FC<ProcessingProps> = React.memo(({ trackingId, status }) => {
  const currentStatus = status?.status ?? (trackingId ? "queued" : "unknown");
  const copy = statusCopy[currentStatus] ?? statusCopy.unknown;

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

        {trackingId && (
          <div className="mt-4 bg-gray-100 dark:bg-gray-800/60 rounded-lg px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
            <p className="font-medium text-gray-800 dark:text-gray-200">Tracking ID</p>
            <p className="font-mono text-xs sm:text-sm break-all">{trackingId}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" aria-hidden="true" />
              Berlaku hingga 60 menit sejak permintaan dibuat.
            </p>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          Status terakhir: <span className="font-semibold text-primary-600 dark:text-primary-400">{statusLabel(status?.status)}</span>
        </div>

        {status?.message && (
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl">
            Keterangan: {status.message}
          </p>
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
          Sistem akan memperbarui status secara otomatis menggunakan polling dengan jeda adaptif. Anda dapat menutup halaman setelah
          mendapatkan status final atau mengikuti instruksi yang diberikan pada halaman invoice.
        </div>
      </div>
    </section>
  );
});

Processing.displayName = "Processing";

export default Processing;
