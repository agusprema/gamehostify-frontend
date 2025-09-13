"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useDeferredValue,
  useMemo,
  useTransition,
  Suspense,
  memo,
} from "react";
import dynamic from "next/dynamic";
import { useCart } from "@/contexts/CartContext";
import { getCartToken } from "@/lib/cart/getCartToken";
import { apiFetch } from "@/lib/apiFetch";
import { joinUrl } from "@/lib/url";

// --- Dynamic imports (code splitting) ---
const CartHeader = dynamic(() => import("./CartHeader"), { ssr: false });
const CartFooter = dynamic(() => import("./CartFooter"), { ssr: false });
const CartItems = dynamic(() => import("./CartItems"), { ssr: false });
const CartSkeleton = dynamic(() => import("./CartSkeleton"), {
  ssr: false,
  loading: () => <LocalSkeleton />,
});
const EmptyCart = dynamic(() => import("./EmptyCart"), {
  ssr: false,
  loading: () => <LocalSkeleton />,
});

// Skeleton ringan modul
const LocalSkeleton = memo(() => (
  <div className="rounded-xl border border-gray-300 dark:border-gray-700/50 bg-gray-100 dark:bg-gray-800/40 h-16 animate-pulse" />
));

// Helper untuk prefetch chunk modul cart saat idle
const preloadCartChunks = () => {
  void import("./CartHeader");
  void import("./CartFooter");
  void import("./CartItems");
  void import("./CartSkeleton");
  void import("./EmptyCart");
};

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  /** how long before cart data considered stale (ms). default 30s */
  staleTime?: number;
}

function CartComponent({ isOpen, onClose, staleTime = 30_000 }: CartProps) {
  const { cart, quantity, fetchCart, fetchQuantity } = useCart();
  const [loadingCart, setLoadingCart] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Track last successful fetch
  const [lastFetched, setLastFetched] = useState<number>(0);

  // Keep panel mounted after first open to avoid re-hydration cost
  const [everOpened, setEverOpened] = useState(false);
  useEffect(() => {
    if (isOpen && !everOpened) setEverOpened(true);
  }, [isOpen, everOpened]);

  // Preload dynamic chunks + data saat idle setelah pertama kali dibuka
  useEffect(() => {
    if (!everOpened) return;
    if (typeof window === "undefined") return;
    preloadCartChunks();
  }, [everOpened]);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "auto";
    };
  }, [isOpen]);

  // Fetch cart when opening IF stale
  useEffect(() => {
    if (!isOpen) return;
    const now = Date.now();
    if (now - lastFetched <= staleTime) return;

    let active = true;
    (async () => {
      try {
        setLoadingCart(true);
        await fetchCart();
        if (active) setLastFetched(Date.now());
      } finally {
        if (active) setLoadingCart(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isOpen, staleTime, lastFetched, fetchCart]);

  // Remove item (transition to keep UI responsive)
  const handleRemoveItem = useCallback(
    (cartItemId: string) => {
      setRemovingId(cartItemId);
      startTransition(async () => {
        try {
          const token = await getCartToken();
          const headers: Record<string, string> = {
            Accept: "application/json",
            "Content-Type": "application/json",
          };
          if (token) headers["X-Cart-Token"] = token;
          const res = await apiFetch(
            joinUrl(process.env.BACKEND_API_BASE_URL, 'api/v1/cart/remove'),
            {
              method: "DELETE",
              headers,
              credentials: "include",
              body: JSON.stringify({ cart_item_id: cartItemId }),
            }
          );
          if (!res.ok) throw new Error("Gagal menghapus item");
          await Promise.all([fetchCart(), fetchQuantity()]);
          setLastFetched(Date.now());
        } catch (err) {
          console.error("Error remove:", err);
        } finally {
          setRemovingId(null);
        }
      });
    },
    [fetchCart, fetchQuantity, startTransition]
  );


  // Checkout
  const handleCheckout = useCallback(() => {
    onClose();
  }, [onClose]);


  // --- Cart derived state ---
  // Convert CartItem[] to BaseCartItem[] for compatibility
  const toBaseCartItem = (item: any) => ({
    name: item.name,
    image: item.image,
    createdAt: item.createdAt || '',
    quantity: item.quantity,
    subtotal: item.subtotal,
    packages: item.packages
      ? {
          name: item.packages.name,
          image: item.image, // fallback to product image
          price: item.packages.price ?? 0,
          amount: item.packages.amount,
          items: item.packages.items,
          discount_applied: item.packages.discount_applied ?? undefined,
        }
      : undefined,
  });
  const stableItems = useMemo(() => (cart?.items ?? []).map(toBaseCartItem), [cart?.items]);
  const deferredItems = useDeferredValue(stableItems);
  const isDeferredPending = stableItems !== deferredItems;
  const formattedTotal = useMemo(() =>
    cart && typeof cart.total === 'number'
      ? `Rp${cart.total.toLocaleString('id-ID')}`
      : '-',
    [cart]
  );

  const hasItems = stableItems.length > 0;
  const showItems = !loadingCart && hasItems;
  const showEmpty = !loadingCart && !hasItems;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      {everOpened && (
        <aside
          aria-hidden={!isOpen}
          className={`fixed right-0 top-0 h-full w-full max-w-md z-50
            bg-gradient-to-b from-gray-50 via-primary-100/50 to-primary-100
          dark:from-black dark:via-primary-950 dark:to-primary-900
            backdrop-blur-sm border-l border-gray-200 dark:border-primary-500/20 shadow-xl
            flex flex-col transform transition-transform duration-300 ease-out
            ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          {/* Header */}
          <Suspense fallback={<LocalSkeleton />}>
            <CartHeader quantity={quantity} onClose={onClose} />
          </Suspense>

          {/* Content */}
          <section className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
            {loadingCart ? (
              <Suspense fallback={<LocalSkeleton />}>
                <CartSkeleton count={3} />
              </Suspense>
            ) : showEmpty ? (
              <Suspense fallback={<LocalSkeleton />}>
                <EmptyCart />
              </Suspense>
            ) : showItems ? (
              <>
                {isDeferredPending && <LocalSkeleton />}
                <Suspense fallback={<LocalSkeleton />}>
                  <CartItems
                    items={deferredItems}
                    removingId={removingId}
                    onRemove={handleRemoveItem}
                  />
                </Suspense>
              </>
            ) : null}
          </section>

          {/* Footer */}
          {showItems && (
            <Suspense fallback={<LocalSkeleton />}>
              <CartFooter
                totalFormatted={formattedTotal}
                onCheckout={handleCheckout}
              />
            </Suspense>
          )}
        </aside>
      )}
    </>
  );
}

export default memo(CartComponent);
