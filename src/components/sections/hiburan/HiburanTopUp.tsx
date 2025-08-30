"use client";
import React, { useState } from "react";
import { Hiburan, HiburanPackage } from "./types";
import { useCart } from "@/contexts/CartContext";
import { HiburanGrid } from "./HiburanGrid";
import { HiburanModal } from "./HiburanModal";
import Link from "@/components/ui/Link";

export interface HiburanTopUpProps {
  hiburans: Hiburan[];
  isHome?: boolean;
}

export default function HiburanTopUp({ hiburans, isHome = false }: HiburanTopUpProps) {
  const { addToCart } = useCart();
  const [selected, setSelected] = useState<Hiburan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const handleTopUp = async (pkg: HiburanPackage, target: string) => {
    if (!pkg || !target.trim()) return;
    setIsProcessing(true);
    try {
      const { success, errors } = await addToCart({
        purchasable_type: pkg.type,
        purchasable_id: pkg.id,
        target: target.trim(),
        target_type: "phone",
        quantity: 1,
      });

      if (!success) {
        setFormErrors(errors || {});
        return;
      }

      setSelected(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="py-8" aria-label="Hiburan Packages">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HiburanGrid
          hiburans={hiburans}
          onSelect={(e) => {
            setSelected(e);
            setFormErrors({});
          }}
          isHome={isHome}
        />
      </div>

      {isHome && (
        <div className="mt-12 text-center">
          <Link
            href="/hiburan"
            className="group inline-flex items-center px-10 py-4 rounded-xl font-semibold
              text-white dark:text-white bg-gradient-to-r from-primary-500 to-primary-700
              hover:scale-105 transition"
            aria-label="Lihat semua produk hiburan"
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
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      <HiburanModal
        hiburan={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        onSubmit={handleTopUp}
        submitting={isProcessing}
        formErrors={formErrors}
      />
    </section>
  );
}
