export interface HiburanPackage {
  id: string;
  code: string;
  name: string;
  type: string;
  amount: string;
  final_price: number;
  original_price?: number;
  has_discount: boolean;
  is_popular?: boolean;
  metadata?: Record<string, unknown>;
}

export interface Hiburan {
  id: string;
  name: string;
  slug: string;
  logo: string;
  label: string;
  type_package: string;
  placeholder: string;
  description: string;
  is_popular?: boolean;
  total_packages: number;
}
