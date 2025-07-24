'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { getCartToken } from '@/lib/cart/getCartToken';
import {
  CartData,
  CartItem,
  CartPackageNormalised,
  PackageEntry,
} from '@/components/checkout/types/checkout';

/* --- optional: ubah ke path publik img placeholder kamu --- */
const FALLBACK_IMAGE = '/default.png';

interface CartContextValue {
  cart: CartData;
  quantity: number;
  fetchCart: () => Promise<void>;
  fetchQuantity: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

/* ---------------- Normalizer util (raw -> CartItem) ---------------- */

type RawCartItem = {
  id?: string;
  createdAt?: string;
  product?: {
    id?: string;
    name?: string;
    logo?: string;
    type?: string;
    subtotal?: number;
    packages?: {
      name?: string;
      code?: string;
      amount?: string;
      price?: number;
      items?: Array<{ target?: string; quantity?: number; id?: string }>;
      discount_applied?: number | null;
    };
  };
};

function normalizeCartItem(raw: RawCartItem): CartItem {
  const product = raw.product ?? {};
  const pkg = product.packages ?? {};

  const pkgItemsRaw = Array.isArray(pkg.items) ? pkg.items : [];
  const pkgItems: PackageEntry[] = pkgItemsRaw.map((i) => ({
    target: i?.target ?? '',
    quantity: typeof i?.quantity === 'number' ? i.quantity : 0,
    id: i?.id ?? '',
  }));

  const quantity = pkgItems.reduce((sum, curr) => sum + curr.quantity, 0);

  const normalizedPkg: CartPackageNormalised = {
    name: pkg.name ?? '',
    amount: pkg.amount ?? '',
    price: typeof pkg.price === 'number' ? pkg.price : undefined,
    discount_applied:
      typeof pkg.discount_applied === 'number' ? pkg.discount_applied : null,
    items: pkgItems,
  };

  return { // fallback unik
    name: product.name ?? 'Unknown Product',
    image: product.logo && product.logo.trim() !== '' ? product.logo : FALLBACK_IMAGE,
    quantity,
    subtotal: typeof product.subtotal === 'number' ? product.subtotal : 0,
    category: product.type,
    createdAt: raw.createdAt,
    packages: normalizedPkg,
  };
}

/* ---------------- Provider ---------------- */

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartData>({ items: [], total: 0 });
  const [quantity, setQuantity] = useState(0);

  // ------------------- FETCH CART -------------------
  const fetchCart = useCallback(async () => {
    try {
      const token = await getCartToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1/cart`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Cart-Token': token ?? '',
        },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Gagal mengambil cart');

      const json = await res.json();
      if (json.status === 'success') {
        const rawItems: RawCartItem[] = Array.isArray(json?.data?.items)
          ? json.data.items
          : [];

        const items: CartItem[] = rawItems.map(normalizeCartItem);

        setCart({
          total: typeof json?.data?.total === 'number' ? json.data.total : 0,
          items,
        });

        // sinkronkan quantity root kalau API punya
        if (typeof json?.data?.quantity === 'number') {
          setQuantity(json.data.quantity);
        } else {
          // fallback hitung total quantity dari items
          setQuantity(items.reduce((sum, it) => sum + it.quantity, 0));
        }
      }
    } catch (err) {
      console.error('fetchCart error:', err);
    }
  }, []);

  // ------------------- FETCH QUANTITY -------------------
  const fetchQuantity = useCallback(async () => {
    try {
      const token = await getCartToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1/cart/quantity`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Cart-Token': token ?? '',
          },
          credentials: 'include',
        }
      );
      if (!res.ok) throw new Error('Gagal mengambil quantity');
      const json = await res.json();
      if (json.status === 'success') {
        setQuantity(json.data.quantity ?? 0);
      }
    } catch (err) {
      console.error('fetchQuantity error:', err);
    }
  }, []);

  // ------------------- INIT DATA -------------------
  useEffect(() => {
    (async () => {
      await Promise.all([fetchCart(), fetchQuantity()]);
    })();
  }, [fetchCart, fetchQuantity]);

  const value: CartContextValue = {
    cart,
    quantity,
    fetchCart,
    fetchQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/* ---------------- Hook ---------------- */

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
