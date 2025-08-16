"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Loader2, Package, User, Zap, Shield, X } from "lucide-react";
import Image from "next/image";
import Modal from "@/components/ui/Modal";
import FormError from "@/components/ui/FormError";
import Link from "@/components/ui/Link";
import { useCart } from "@/contexts/CartContext";
import { getCartToken } from "@/lib/cart/getCartToken";
import GameGrid from "./GameGrid";
import { Game, GamePackage, GameTopUpProps, Category } from "./types";
import { handleApiErrors } from "@/utils/apiErrorHandler";
import GameFilterBar from "./GameFilterBar";

/* ---------- Debounce ---------- */
function debounce<T extends (...args: unknown[]) => void>(fn: T, delay = 400) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
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

  /* ---------- Fetch Categories ---------- */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1/category/games`,
        { headers: { Accept: "application/json" }, cache: "no-store" }
      );
      const json = await res.json();
      const data = json?.data ?? {};

      const mappedCategories: Category[] = Object.entries(data).map(
        ([key, value]) => ({ key, value: String(value) })
      );
      setCategories(mappedCategories);
    } catch (err) {
      console.error("Fetch categories error:", err);
    }
  }, []);

  useEffect(() => {
    if (!isHome) fetchCategories();
  }, [fetchCategories, isHome]);

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
        const url = new URL(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1/games`
        );
        url.searchParams.set("per_page", "24");
        if (cursorParam) url.searchParams.set("cursor", cursorParam);
        if (searchParam) url.searchParams.set("search", searchParam);
        if (categoryParam) url.searchParams.set("category", categoryParam);

        const res = await fetch(url.toString(), {
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
        console.error("Fetch games error:", err);
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1/cart/add`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Cart-Token": token ?? "",
          },
          body: JSON.stringify({
            purchasable_type: selectedPackage.type,
            purchasable_id: selectedPackage.id,
            target: gameAccount,
            target_type: "player_id",
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
        setSelectedGame(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedGame, selectedPackage, gameAccount, fetchQuantity, fetchCart]);

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
      {selectedGame && (
        <Modal
          isOpen={!!selectedGame}
          onClose={() => setSelectedGame(null)}
          containerClassName="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-gray-200 dark:border-gray-700"
        >
          <>
            {/* Header */}
            <div
              className="flex items-center justify-between p-5 border-b bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-center gap-4">
                <Image
                  src={selectedGame.logo}
                  alt={selectedGame.name}
                  width={200}
                  height={200}
                  className="w-14 h-14 rounded-lg object-cover"
                />
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedGame.name}</h2>
                  <span className="text-primary-600 dark:text-primary-400 text-sm">{selectedGame.category}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedGame(null)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition cursor-pointer"
                aria-label="Close"
              >
                <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="grid lg:grid-cols-3 gap-6 p-5 custom-scrollbar">
              {/* Package List */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                  Pilih Paket
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2 pt-2">
                  {selectedGame.packages.map((pkg) => {
                    const discount =
                      pkg.original_price && pkg.original_price > pkg.final_price
                        ? Math.round(((pkg.original_price - pkg.final_price) / pkg.original_price) * 100)
                        : 0;
                    const isSel = selectedPackage?.id === pkg.id;

                    return (
                      <button
                        type="button"
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`
                      relative w-full text-left p-4 rounded-xl border transition-all cursor-pointer
                      ${
                        isSel
                          ? "border-primary-500 bg-gray-100 dark:bg-gray-800 shadow-md"
                          : "border-gray-300 bg-gray-50 hover:border-primary-400 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-primary-400/40"
                      }
                    `}
                      >
                        {pkg.is_popular && (
                          <span className="absolute -top-2 left-3 bg-primary-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            Popular
                          </span>
                        )}
                        {pkg.has_discount && (
                          <span className="absolute -top-2 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            -{discount}%
                          </span>
                        )}
                        <div className="text-center space-y-2">
                          <h4 className="text-gray-900 dark:text-white font-bold">{pkg.amount}</h4>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">{pkg.name}</p>
                          <div className="flex justify-center gap-2">
                            <span className="text-primary-600 dark:text-primary-400 font-bold">
                              Rp {pkg.final_price.toLocaleString()}
                            </span>
                            {pkg.original_price && pkg.has_discount && (
                              <span className="text-gray-400 line-through text-xs">
                                Rp {pkg.original_price.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {pkg.metadata?.bonus && (
                            <p className="text-green-500 dark:text-green-400 text-xs font-medium">
                              + {pkg.metadata.bonus} Bonus
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 h-fit">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                  {selectedGame.label}
                </h3>

                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={selectedGame.placeholder}
                      value={gameAccount}
                      onChange={(e) => setGameAccount(e.target.value)}
                      className="w-full p-3 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <Zap className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  </div>
                  {formErrors.account && <FormError errors={formErrors.account} />}

                  <button
                    onClick={handleTopUp}
                    disabled={!selectedPackage || !gameAccount.trim() || isProcessing}
                    className="w-full py-3 rounded-lg font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Shield className="h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Add to Cart"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        </Modal>
      )}
    </section>
  );
};

export default GameTopUp;
