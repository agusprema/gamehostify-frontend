// src/components/invoice/status.ts
export type InvoiceStatus =
  | "WAITING_PAYMENT"
  | "ACCEPTING_PAYMENTS"
  | "REQUIRES_ACTION"
  | "AUTHORIZED"
  | "SUCCEEDED"
  | "FAILED"
  | "EXPIRED"
  | "CANCELED"
  | "PENDING"
  | string; // fallback

export const readableStatus = (status: InvoiceStatus): string => {
  switch (status) {
    case "WAITING_PAYMENT":
    case "ACCEPTING_PAYMENTS":
      return "Menunggu Pembayaran";
    case "REQUIRES_ACTION":
      return "Memerlukan Tindakan";
    case "AUTHORIZED":
      return "Terverifikasi";
    case "SUCCEEDED":
      return "Pembayaran Berhasil";
    case "FAILED":
      return "Gagal";
    case "EXPIRED":
      return "Kadaluarsa";
    case "CANCELED":
      return "Dibatalkan";
    case "PENDING":
      return "Sedang Diproses";
    default:
      return status;
  }
};

export const statusColor = (status: InvoiceStatus): string => {
  switch (status) {
    case "SUCCEEDED":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "PENDING":
    case "WAITING_PAYMENT":
    case "ACCEPTING_PAYMENTS":
    case "REQUIRES_ACTION":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    case "FAILED":
    case "EXPIRED":
    case "CANCELED":
      return "bg-red-500/20 text-red-300 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  }
};
