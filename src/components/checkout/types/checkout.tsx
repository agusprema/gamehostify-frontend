export type CheckoutStep =
  | "loading"
  | "info"
  | "payment"
  | "processing"
  | "success"
  | "loadingPay"; // Keep to stay compatible with StepIndicator & existing UI

export interface CustomerFormValues {
  name: string;
  email: string;
  phone: string; // phone_number di payload API
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

export interface CartPackageNormalised {
  name: string;
  amount?: string;
  price?: number;
  discount_applied?: number | null;
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
  items: CartItem[];
}