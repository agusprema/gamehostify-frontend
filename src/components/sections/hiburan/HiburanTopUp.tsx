"use client";
import React, { useState, useEffect, useId } from "react";
import { Hiburan, HiburanPackage } from "./types";
import { useCart } from "@/contexts/CartContext";
import { getCartToken } from "@/lib/cart/getCartToken";
import { handleApiErrors } from "@/utils/apiErrorHandler";
import { HiburanGrid } from "./HiburanGrid";
import Image from "next/image";
import Modal from "@/components/ui/Modal";
import Link from "@/components/ui/Link";

export interface HiburanTopUpProps {
  hiburans: Hiburan[];
  isHome?: boolean;
}

export default function HiburanTopUp({ hiburans, isHome = false }: HiburanTopUpProps) {
  const { fetchCart, fetchQuantity } = useCart();
  const [selected, setSelected] = useState<Hiburan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [target, setTarget] = useState("");
  const [selectedPkg, setSelectedPkg] = useState<HiburanPackage | null>(null);
  const inputId = useId();

  useEffect(() => {
    setTarget("");
    setSelectedPkg(null);
  }, [selected]);

  const handleConfirm = async () => {
    if (!selectedPkg || !target.trim()) return;
    await handleTopUp(selectedPkg, target.trim());
  };

  const handleTopUp = async (pkg: HiburanPackage, target: string) => {
    if (!pkg || !target.trim()) return;
    setIsProcessing(true);
    try {
      const token = await getCartToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1/cart/add`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Cart-Token": token ?? "",
        },
        body: JSON.stringify({
          purchasable_type: pkg.type,
          purchasable_id: pkg.id,
          target: target.trim(),
          target_type: "phone",
          quantity: 1,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        const { fields } = handleApiErrors(json);
        setFormErrors(fields || {});
        return;
      }

      if (json.status === "success") {
        await Promise.all([fetchCart(), fetchQuantity()]);
        setSelected(null);
      }
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

      {selected && (
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          containerClassName="max-w-xl p-8"
          ariaLabelledby={`hib-modal-title-${inputId}`}
        >
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <Image src={selected.logo} alt={selected.name} fill className="rounded-xl object-contain" />
                </div>
                <div>
                  <h3 id={`hib-modal-title-${inputId}`} className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selected.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{selected.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {selected.label}
              </label>
              <input
                id={inputId}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder={selected.placeholder}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-invalid={!!formErrors.target}
              />
              {formErrors.target && <p className="text-red-600 text-sm mt-2">{formErrors.target[0]}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 max-h-64 overflow-y-auto pr-2">
              {selected.packages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPkg(pkg)}
                  className={`p-4 border rounded-xl text-left transition hover:border-primary-500 ${
                    selectedPkg?.id === pkg.id
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10"
                      : "border-gray-300 dark:border-gray-700"
                  }`}
                >
                  <p className="font-semibold text-gray-800 dark:text-white">{pkg.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rp {pkg.final_price.toLocaleString("id-ID")}</p>
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleConfirm}
                disabled={isProcessing || !selectedPkg || !target.trim()}
                className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-700 disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Add to Cart"}
              </button>
            </div>
          </>
        </Modal>
      )}
    </section>
  );
}
