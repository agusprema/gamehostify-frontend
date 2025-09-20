export type CommonPackage = {
  id: string;
  name: string;
  final_price: number;
  original_price?: number;
  amount?: string;
  type?: string;
  is_popular?: boolean;
  has_discount?: boolean;
  metadata?: { bonus?: string };
};

export interface PackageGroup {
  key: string;
  label: string;
  packages: CommonPackage[];
}

