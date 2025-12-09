"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Loader2 } from "lucide-react";
import ProductModal from "@/components/ui/Modal/ProductModal";
import { CommonPackage } from "@/components/ui/Modal/types";
import Link from "@/components/ui/Link";
import { useCart } from "@/contexts/CartContext";
import { getCartToken } from "@/lib/cart/getCartToken";
import GameGrid from "./GameGrid";
import { Game, GamePackage, GameTopUpProps, Category } from "./types";
import { handleApiErrors } from "@/utils/apiErrorHandler";
import GameFilterBar from "./GameFilterBar";
import { apiFetch } from "@/lib/apiFetch";
import { joinUrl } from "@/lib/url";
import logger from "@/lib/logger";
import { useToast } from "@/components/ui/ToastProvider";

/* ---------- Debounce ---------- */
function debounce<Args extends unknown[]>(fn: (...args: Args) => void, delay = 400) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

const GameTopUp: React.FC<GameTopUpProps> = ({
  games: initialGames,
  nextCursor: initialCursor = null,
  hasMore: initialHasMore = false,
  isHome = false,
  scrollTriggerRatio = 0.4,
  height = 800,
}) => {
  const { fetchQuantity, fetchCart } = useCart();
  const toast = useToast();

  /* ---------- States ---------- */
  const [games, setGames] = useState<Game[]>(initialGames);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [hasMoreState, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const isFetchingRef = useRef(false);

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<GamePackage | null>(null);
  const [gameAccount, setGameAccount] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [gamePackages, setGamePackages] = useState<GamePackage[]>([]);
  const [loadingPkgs, setLoadingPkgs] = useState(false);

  /* ---------- Fetch Categories ---------- */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await apiFetch(
        joinUrl(process.env.BACKEND_API_BASE_URL, 'api/v1/category/games'),
        { headers: { Accept: "application/json" }, cache: "no-store" }
      );
      const json = await res.json();
      const data = json?.data ?? {};

      const mappedCategories: Category[] = Object.entries(data).map(
        ([key, value]) => ({ key, value: String(value) })
      );
      setCategories(mappedCategories);
    } catch (err) {
      logger.error("Fetch categories error:", err);
    }
  }, []);

  useEffect(() => {
    if (!isHome) fetchCategories();
  }, [fetchCategories, isHome]);

  /* ---------- Fetch Packages for Selected Game (lazy) ---------- */
  useEffect(() => {
    let aborted = false;
    setFormErrors({});
    setSelectedPackage(null);
    setGameAccount("");
    setGamePackages([]);
    const load = async () => {
      if (!selectedGame?.slug) return;
      try {
        setLoadingPkgs(true);
        const res = await apiFetch(`api/v1/games/${selectedGame.slug}/packages`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const json = await res.json();
        if (json?.status === "success") {
          const list: GamePackage[] = json?.data?.packages ?? [];
          if (!aborted) setGamePackages(list);
        }
      } catch (e) {
        logger.error("Load game packages failed", e);
      } finally {
        if (!aborted) setLoadingPkgs(false);
      }
    };
    if (selectedGame) load();
    return () => {
      aborted = true;
    };
  }, [selectedGame]);

  /* ---------- Fetch Games ---------- */
  const fetchGames = useCallback(
    async ({
      append = false,
      searchParam = search,
      categoryParam = category,
      cursorParam = null,
    }: {
      append?: boolean;
      searchParam?: string;
      categoryParam?: string;
      cursorParam?: string | null;
    }) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setIsProcessing(true);

      try {
        const url = new URL("api/v1/games", process.env.NEXT_PUBLIC_BASE_URL);
        url.searchParams.set("per_page", "24");
        if (cursorParam) url.searchParams.set("cursor", cursorParam);
        if (searchParam) url.searchParams.set("search", searchParam);
        if (categoryParam) url.searchParams.set("category", categoryParam);

        logger.debug(url.toString());
        const res = await apiFetch(url.toString(), {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const json = await res.json();
        const data = json?.data;
        const newGames: Game[] = data?.games ?? [];

        setGames((prev) => (append ? [...prev, ...newGames] : newGames));
        setCursor(data?.next_cursor ?? null);
        setHasMore(Boolean(data?.has_more));
      } catch (err) {
        logger.error("Fetch games error:", err);
      } finally {
        setLoadingMore(false);
        isFetchingRef.current = false;
        setIsProcessing(false);
      }
    },
    [search, category]
  );

  const debouncedFetchGames = useRef(
    debounce((val: string, currentCategory: string) => {
      fetchGames({
        append: false,
        searchParam: val,
        categoryParam: currentCategory,
      });
    }, 400)
  ).current;

  const handleLoadMore = useCallback(() => {
    if (!cursor) return;
    fetchGames({ append: true, cursorParam: cursor });
  }, [cursor, fetchGames]);

  /* ---------- Handle Top-Up ---------- */
  const handleTopUp = useCallback(async () => {
    if (!selectedGame || !selectedPackage || !gameAccount.trim()) return;
    setIsProcessing(true);
    try {
      const token = await getCartToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) headers["X-Cart-Token"] = token;
      const response = await apiFetch(
        joinUrl(process.env.BACKEND_API_BASE_URL, 'api/v1/cart/add'),
        {
          method: "POST",
          credentials: "include",
          headers,
          body: JSON.stringify({
            purchasable_type: selectedPackage.type,
            purchasable_id: selectedPackage.id,
            target: gameAccount,
            target_type: "user_id",
            quantity: 1,
          }),
        }
      );

      const json = await response.json();

      if (!response.ok) {
        const { fields } = handleApiErrors(json);
        setFormErrors(fields || {});
        return;
      }

      if (json.status === "success") {
        await Promise.all([fetchCart(), fetchQuantity()]);
        toast.success("Berhasil ditambahkan ke keranjang.");
        setSelectedGame(null);
      }
    } catch (err) {
      logger.error(err);
      toast.error("Gagal menambahkan ke keranjang. Silakan coba lagi.");
    } finally {
      setIsProcessing(false);
    }
  }, [toast, selectedGame, selectedPackage, gameAccount, fetchQuantity, fetchCart]);

  return (
    <section className="relative py-16">
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Filter Bar */}
        {!isHome && (
          <GameFilterBar
            search={search}
            onSearchChange={(val) => {
              setSearch(val);
              debouncedFetchGames(val, category);
            }}
            category={category}
            onCategoryChange={(val) => {
              setCategory(val);
              fetchGames({ append: false, searchParam: search, categoryParam: val });
            }}
            categories={categories}
            isProcessing={isProcessing}
          />
        )}

        {/* Game Grid */}
        {games.length > 0 ? (
          <GameGrid
            games={games}
            height={height}
            onSelect={(g) => {
              setSelectedGame(g);
              setSelectedPackage(null);
              setGameAccount("");
            }}
            fetchMore={handleLoadMore}
            hasMore={hasMoreState}
            isHome={isHome}
            loadingMore={loadingMore}
            scrollTriggerRatio={scrollTriggerRatio}
          />
        ) : (
          !isProcessing && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Game Tidak Ditemukan
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Kami tidak dapat menemukan game yang sesuai dengan pencarian Anda. 
                Coba gunakan kata kunci lain atau pilih kategori berbeda.
              </p>
            </div>
          )
        )}

        {/* Loading More */}
        {!isHome && hasMoreState && loadingMore && (
          <div className="h-12 flex justify-center items-center mt-6">
            <div className="flex items-center gap-2 text-primary-500 dark:text-primary-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Memuat lebih banyak...
            </div>
          </div>
        )}

        {/* CTA di Home */}
        {isHome && (
          <div className="mt-12 text-center">
            <Link
              href="/game-topup"
              className="group inline-flex items-center px-10 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-700 hover:scale-105 transition"
            >
              <span className="pr-2">Lihat Semua Produk</span>
              <svg
                className="h-4 w-4 translate-x-0 group-hover:translate-x-1 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* Modal */}
      <ProductModal
        open={!!selectedGame}
        onClose={() => setSelectedGame(null)}
        layout="wide"
        size="xl"
        product={{
          logo: selectedGame?.logo || "",
          name: selectedGame?.name || "",
          category: selectedGame?.category,
          label: selectedGame?.label || "Akun",
          placeholder: selectedGame?.placeholder || "",
        }}
        target={gameAccount}
        onTargetChange={setGameAccount}
        errorMessages={formErrors.target ?? []}
        groups={[{ key: "default", label: "Paket", packages: ((gamePackages || []) as unknown as CommonPackage[]) }]}
        activeGroupKey="default"
        onGroupChange={() => {}}
        selectedPackage={selectedPackage as unknown as CommonPackage}
        onSelectPackage={(p) => setSelectedPackage(p as GamePackage)}
        submitting={isProcessing || loadingPkgs}
        packagesLoading={loadingPkgs}
        onConfirm={handleTopUp}
        confirmText="Add to Cart"
      />
    </section>
  );
};

export default GameTopUp;
