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
import { useLoader } from "@/contexts/LoaderContext";
import { useRouter, usePathname } from "next/navigation";
import { getCartToken } from "@/lib/cart/getCartToken";
import type { BaseCartItem } from "./types";

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
  const router = useRouter();
  const { showLoader } = useLoader();
  const pathname = usePathname();

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

    const idleCb = () => {
      preloadCartChunks();
      if (Date.now() - lastFetched > staleTime) {
        fetchCart().then(() => setLastFetched(Date.now()));
      }
    };

    let cancel: (() => void) | undefined;
    const w = window as any;

    if (typeof w.requestIdleCallback === "function") {
      const handle = w.requestIdleCallback(idleCb, { timeout: 1500 });
      cancel = () => {
        if (typeof w.cancelIdleCallback === "function") {
          w.cancelIdleCallback(handle);
        }
      };
    } else {
      const handle = setTimeout(idleCb, 1);
      cancel = () => clearTimeout(handle);
    }

    return cancel;
  }, [everOpened, lastFetched, staleTime, fetchCart]);

  const total = cart?.total ?? 0;
  const cartItems = useMemo(
    () => (Array.isArray(cart?.items) ? (cart.items as BaseCartItem[]) : []),
    [cart?.items]
  );

  const formattedTotal = useMemo(
    () => `Rp${total.toLocaleString("id-ID")}`,
    [total]
  );

  // Stabilize items by copying ref only when array identity changes
  const stableItems = useMemo(() => cartItems.slice(), [cartItems]);

  // Defer heavy list rendering
  const deferredItems = useDeferredValue(stableItems);
  const isDeferredPending = deferredItems !== stableItems;

  // Lock scroll only when actually visible
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
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1/cart/remove`,
            {
              method: "DELETE",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-Cart-Token": token ?? "",
              },
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
            bg-white dark:bg-gradient-to-br dark:from-gray-900/80 dark:to-gray-800/60
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
