export type CheckoutStep =
  | "loading"
  | "info"
  | "payment"
  | "processing"
  | "success"
  | "loadingPay"; // Keep to stay compatible with StepIndicator & existing UI

export type PaymentQueueStatus =
  | "queued"
  | "PROCESSING"
  | "MANUAL_REVIEW"
  | "SUCCEEDED"
  | "FAILED"
  | "REQUIRES_ACTION"
  | "WAITING_PAYMENT"
  | "REFUND"
  | "PENDING"
  | "ACCEPTING_PAYMENTS"
  | "AUTHORIZED"
  | "CANCELED"
  | "EXPIRED"
  | "INVALID";

export interface PaymentStatusPayload {
  status: PaymentQueueStatus;
  tracking_id: string;
  queued?: boolean;
  reference_id?: string;
  payment_request_id?: string;
  transaction_id?: string;
  // Additional fields enriched by status endpoint
  updated_at?: string;
  transaction?: CheckoutTransaction; // present for REQUIRES_ACTION or SUCCEEDED
  fraud_check_id?: string | null;
  support_case_id?: string | null;
  message?: string | null;
  errors?: Record<string, unknown>;
}

export interface CustomerFormValues {
  name: string;
  email: string;
  phone: string; // phone_number di payload API
}

export interface OrderSummaryFormValues {
  code_cupon: string;
}

/** Bentuk channel dari API payment/methods.
 *  Sesuaikan kalau kamu punya tipe lebih spesifik.
 */
export interface PaymentChannel {
  uuid: string;
  code: string;
  name: string;
  logo: string;
  fee_type: string;
  fee_value: number;
}

export type PaymentMethodsMap = Record<string, PaymentChannel[]>;

/** Bentuk data transaksi dari endpoint invoice.
 *  Sesuaikan untuk strong typing.
 */

export interface TransactionAction {
  type: string;
  descriptor?: string;
  value?: string;
  url?: string;
}

export interface CheckoutTransaction {
  invoice_id: string;
  reference_id: string;
  amount: number;
  payment_method: string;
  status: string;
  actions?: TransactionAction[];
  cancellation_token?: string;
  is_successful: boolean | null;
  paid_at: string | null;
  created_at: string;
  expired_at?: string;
}

export interface PackageEntry {
  target: string;
  quantity: number;
  id: string;
}

export interface discount_applied {
  id: string;
  //code: string;
  //name: string;
  type: 'percentage' | 'fixed';
  label: string;
  value: string;
  //is_global: boolean;
  amount_saved: number;
};

export interface CartPackageNormalised {
  name: string;
  amount?: string;
  price?: number;
  discount_applied?: discount_applied | null;
  items: PackageEntry[]; // always array after normalization
}

export interface CartItem {
  name: string;
  image: string;             // guaranteed setelah normalisasi
  quantity: number;          // total dari items.reduce
  subtotal: number;          // dari product.subtotal
  category?: string;         // product.type
  createdAt?: string;
  packages: CartPackageNormalised;
}

export interface CartData {
  total: number;
  save_amount: number;
  items: CartItem[];
  code: string | null;
}
