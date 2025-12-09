"use client";

import React, { useState } from "react";
import GameTopUp from "@/components/sections/Game/GameTopUp";
import PulsaTopUp from "@/components/sections/pulsa-data/PulsaTopUp";
import { Operator } from "@/components/sections/pulsa-data/types";
import { Hiburan } from "@/components/sections/hiburan/types"
import { Game } from "@/components/sections/Game/types"
import HiburanTopup from "@/components/sections/hiburan/HiburanTopUp";

import {
  Shield,
  Zap,
  Star,
  Gamepad2,
  Flag,
  HandCoins,
  LucideIcon,
  CardSim,
  Tickets
} from "lucide-react";

interface ProductGridProps {
  activeCategoryDefault: string;
  games: Game[];
  operators: Operator[];
  entertainments: Hiburan[];
  nextCursor?: string | null;
  hasMore?: boolean;
}

/* ---------- config ---------- */
type FeatureCfg = {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: keyof typeof colorClassMap;
};

const colorClassMap = {
  "emerald-400": "text-emerald-500 dark:text-emerald-400",
  "blue-500": "text-blue-600 dark:text-blue-400",
  "amber-400": "text-amber-500 dark:text-amber-400",
  "indigo-400": "text-indigo-500 dark:text-indigo-400",
  "lime-400": "text-lime-500 dark:text-lime-400",
  "orange-400": "text-orange-500 dark:text-orange-400",
  "violet-400": "text-violet-500 dark:text-violet-400",
  "accent-400": "text-accent-500 dark:text-accent-400",
  "rose-400": "text-rose-500 dark:text-rose-400",
} as const;

const categoryConfigs: Record<
  "topup" | "pulsa" | "langganan",
  { title: string; description: string; features: FeatureCfg[] }
> = {
  topup: {
    title: "Top-up Game",
    description:
      "Isi ulang game favorit Anda dengan pengiriman super cepat dan harga paling bersahabat!",
    features: [
      { icon: Zap, title: "Super Instan", desc: "Saldo terkirim hanya dalam hitungan detik", color: "emerald-400" },
      { icon: Shield, title: "100% Aman", desc: "Transaksi terenkripsi, terpercaya, dan bebas risiko", color: "blue-500" },
      { icon: HandCoins, title: "Harga Termurah", desc: "Nikmati diskon dan promo menarik setiap hari", color: "amber-400" },
    ],
  },
  pulsa: {
    title: "Pulsa & Paket Data",
    description:
      "Isi ulang pulsa dan kuota internet secara instan untuk semua operator. Praktis, cepat, dan 100% aman.",
    features: [
      { icon: Flag, title: "Jangkauan Lengkap", desc: "Tersedia untuk semua provider utama di Indonesia", color: "indigo-400" },
      { icon: Zap, title: "Super Cepat", desc: "Pulsa dan kuota masuk dalam hitungan detik", color: "lime-400" },
      { icon: HandCoins, title: "Harga Hemat", desc: "Pilihan paket hemat untuk semua kebutuhan Anda", color: "amber-400" },
    ],
  },
  langganan: {
    title: "Langganan Premium",
    description:
      "Dapatkan akses Netflix, Spotify, YouTube Premium, dan layanan premium lainnya dengan cepat, aman, dan harga bersahabat.",
    features: [
      { icon: Star, title: "Akun Resmi", desc: "100% legal dan original", color: "violet-400" },
      { icon: Shield, title: "Aman Terpercaya", desc: "Transaksi terjamin tanpa risiko", color: "blue-500" },
      { icon: Zap, title: "Akses Instan", desc: "Langsung aktif setelah pembayaran", color: "lime-400" },
    ],
  },
};

const ProductGrid: React.FC<ProductGridProps> = ({ activeCategoryDefault, games, nextCursor, hasMore, operators, entertainments }) => {
  const [activeCategory, setActiveCategory] = useState<string>(activeCategoryDefault);

  const categories = [
    { name: "Top-up Game", icon: Gamepad2, id: "topup", count: games.length },
    { name: "Pulsa & Data", icon: CardSim, id: "pulsa", count: operators.length },
    { name: "Langganan", icon: Tickets, id: "langganan", count: entertainments.length },
  ];

  const config = categoryConfigs[activeCategory as keyof typeof categoryConfigs];

  // Accessibility: useCallback for category switching
  const handleCategory = React.useCallback((id: string) => setActiveCategory(id), []);

  return (
    <section className="relative min-h-screen py-10" aria-label="Daftar Produk">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Navigation */}
        <nav className="flex flex-wrap justify-center gap-4 mb-12" aria-label="Kategori Produk">
          {categories.map(({ name, id, icon: Icon, count }) => {
            const isActive = activeCategory === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleCategory(id)}
                aria-current={isActive ? "page" : undefined}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 cursor-pointer
                  ${isActive
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                    : "bg-gray-100 dark:bg-gray-900/50 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-white"}
                `}
                aria-label={name}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-primary-500 dark:text-primary-400"}`} aria-hidden="true" />
                <span>{name}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    isActive ? "bg-white/20" : "bg-primary-500/20 text-primary-500 dark:text-primary-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {config?.title.split(" ").map((word, idx, arr) => (
              <span key={idx}>
                {idx === arr.length - 1 ? (
                  <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                    {word}
                  </span>
                ) : (
                  word + " "
                )}
              </span>
            ))}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-3xl mx-auto">{config?.description}</p>
        </div>

        {/* Features */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-center" aria-label="Fitur Kategori">
          {config?.features.map((feature, index) => {
            const ColorIcon = feature.icon;
            return (
              <div
                key={index}
                className="
                  bg-gradient-to-br from-gray-100 to-white dark:from-primary-500/10 dark:to-transparent
                  p-6 rounded-xl border border-gray-300 dark:border-primary-500/20 backdrop-blur-sm
                  hover:scale-105 transition-transform
                "
                aria-label={feature.title}
              >
                <ColorIcon
                  className={`h-8 w-8 mx-auto mb-3 ${colorClassMap[feature.color]}`}
                  aria-hidden="true"
                />
                <h3 className="text-gray-900 dark:text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Products */}
        {activeCategory === "topup" ? (
          <GameTopUp
            games={games}
            isHome
            nextCursor={nextCursor}
            hasMore={hasMore}
            height={300}
          />
        ) : activeCategory === "pulsa" ? (
          <PulsaTopUp operators={operators} isHome={true} />
        ) : activeCategory === "langganan" ? (
          <HiburanTopup 
            hiburans={entertainments}
            isHome={true}
          />
        ) : null}
      </div>
    </section>
  );
};

export default ProductGrid;
