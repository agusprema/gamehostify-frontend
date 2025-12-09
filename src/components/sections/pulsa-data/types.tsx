export interface OperatorPackage {
  id: string;
  code: string;
  name: string;
  type: string; // => purchasable_type
  type_package: "pulsa" | "data";
  amount: string;
  final_price: number;
  original_price?: number;
  has_discount: boolean;
  is_popular?: boolean;
  metadata?: Record<string, unknown>;
}

export interface Operator {
  id: string;
  name: string;
  slug: string;
  logo: string;
  label: string;
  placeholder: string;
  description: string;
  is_popular?: boolean;
  total_packages: number;
}

export interface PulsaTopUpProps {
  operators: Operator[];
  nextCursor?: string | null;
  hasMore?: boolean;
  /** tampil versi ringkas + tombol lihat semua */
  isHome?: boolean;
  /** persentase viewport untuk trigger loadMore (0-1) */
  scrollTriggerRatio?: number;
  /** tinggi grid bila di-virtualize / scroll-container khusus */
  height?: number | string;
}
