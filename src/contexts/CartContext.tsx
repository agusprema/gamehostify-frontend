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
import { apiFetch } from '@/lib/apiFetch';
import {
  CartData,
  CartItem,
  CartPackageNormalised,
  PackageEntry,
  discount_applied
} from '@/components/checkout/types/checkout';

const FALLBACK_IMAGE = '/default.png';

/* -------------------- Types -------------------- */

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
      discount_applied?: discount_applied | null;
    };
  };
};

interface CartContextValue {
  cart: CartData;
  quantity: number;
  fetchCart: () => Promise<void>;
  fetchQuantity: () => Promise<void>;
  applyCouponCode: (code: string, shouldDelete: boolean) => Promise<boolean>;
  updateCart: (target: string, id:string) => Promise<boolean>;
}

/* -------------------- Context -------------------- */

const CartContext = createContext<CartContextValue | undefined>(undefined);

/* -------------------- Normalizer -------------------- */

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
    discount_applied: pkg.discount_applied ?? null,
    items: pkgItems,
  };

  return {
    name: product.name ?? 'Unknown Product',
    image: product.logo && product.logo.trim() !== '' ? product.logo : FALLBACK_IMAGE,
    quantity,
    subtotal: typeof product.subtotal === 'number' ? product.subtotal : 0,
    category: product.type,
    createdAt: raw.createdAt,
    packages: normalizedPkg,
  };
}

/* -------------------- Provider -------------------- */

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartData>({ items: [], total: 0, save_amount: 0, code: null });
  const [quantity, setQuantity] = useState(0);

  const fetchCart = useCallback(async () => {
    try {
      const token = await getCartToken();
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      if (token) headers['X-Cart-Token'] = token;
      const res = await apiFetch(`${process.env.BACKEND_API_BASE_URL}api/v1/cart`, {
        headers,
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
          save_amount: typeof json?.data?.save_amount === 'number' ? json.data.save_amount : 0,
          code: json.data.code ?? null,
          items,
        });

        if (typeof json?.data?.quantity === 'number') {
          setQuantity(json.data.quantity);
        } else {
          setQuantity(items.reduce((sum, it) => sum + it.quantity, 0));
        }
      }
    } catch (err) {
      console.error('fetchCart error:', err);
    }
  }, []);

  const fetchQuantity = useCallback(async () => {
    try {
      const token = await getCartToken();
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      if (token) headers['X-Cart-Token'] = token;
      const res = await apiFetch(`${process.env.BACKEND_API_BASE_URL}api/v1/cart/quantity`, {
        headers,
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Gagal mengambil quantity');

      const json = await res.json();

      if (json.status === 'success') {
        setQuantity(json.data.quantity ?? 0);
      }
    } catch (err) {
      console.error('fetchQuantity error:', err);
    }
  }, []);

  const applyCouponCode = useCallback(async (code: string, shouldDelete: boolean): Promise<boolean> => {
    try {
      const token = await getCartToken();
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      if (token) headers['X-Cart-Token'] = token;
      const res = await apiFetch(`${process.env.BACKEND_API_BASE_URL}api/v1/cart/code`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ code, '_method': shouldDelete ? 'DELETE' : 'POST' }),
      });

      const json = await res.json();

      if (json.status === 'success') {
        const rawItems: RawCartItem[] = Array.isArray(json?.data?.items)
          ? json.data.items
          : [];

        const items: CartItem[] = rawItems.map(normalizeCartItem);

        setCart({
          total: typeof json?.data?.total === 'number' ? json.data.total : 0,
          save_amount: typeof json?.data?.save_amount === 'number' ? json.data.save_amount : 0,
          code: json.data.code ?? null,
          items,
        });
        return true;
      }
    } catch (err) {
      console.error('applyCouponCode error:', err);
      return false;
    }
    return false;
  }, [fetchCart]);

    const updateCart = useCallback(async (target: string, id:string): Promise<boolean> => {
    try {
      const token = await getCartToken();
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      if (token) headers['X-Cart-Token'] = token;
      const res = await apiFetch(`${process.env.BACKEND_API_BASE_URL}api/v1/cart/update`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ target, id }),
      });

      const json = await res.json();

      if (json.status === 'success') {
        const rawItems: RawCartItem[] = Array.isArray(json?.data?.items)
          ? json.data.items
          : [];

        const items: CartItem[] = rawItems.map(normalizeCartItem);

        setCart({
          total: typeof json?.data?.total === 'number' ? json.data.total : 0,
          save_amount: typeof json?.data?.save_amount === 'number' ? json.data.save_amount : 0,
          code: json.data.code ?? null,
          items,
        });
        return true;
      }
    } catch (err) {
      console.error('update cart error:', err);
      return false;
    }
    return false;
  }, [fetchCart]);

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
    applyCouponCode,
    updateCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/* -------------------- Hook -------------------- */

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
