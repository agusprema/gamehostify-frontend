export interface CartPackageEntry {
  readonly target: string;
  readonly quantity: number;
  readonly id: string;
}

export interface CartPackage {
  readonly name: string;
  readonly image: string;
  readonly price: number;              // harga per unit
  readonly amount?: string;            // nominal / durasi (opsional)
  readonly items: CartPackageEntry[];  // bisa kosong
  readonly discount_applied?: number;  // undefined = tidak ada diskon
}

export interface BaseCartItem {
  readonly name: string;
  readonly image: string;
  readonly packages?: CartPackage;     // opsional utk keamanan
  readonly createdAt: string;          // ISO
  readonly quantity: number;           // qty root
  readonly subtotal: number;           // total harga item
}

export interface CartData {
  readonly items: BaseCartItem[];
  readonly total: number;
}
