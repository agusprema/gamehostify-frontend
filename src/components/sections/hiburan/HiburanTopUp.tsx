"use client";
import React, { useEffect, useState } from "react";
import { Hiburan, HiburanPackage } from "./types";
import { useCart } from "@/contexts/CartContext";
import { getCartToken } from "@/lib/cart/getCartToken";
import { handleApiErrors } from "@/utils/apiErrorHandler";
import { HiburanGrid } from "./HiburanGrid";
import ProductModal from "@/components/ui/Modal/ProductModal";
import { CommonPackage } from "@/components/ui/Modal/types";
import Link from "@/components/ui/Link";
import { apiFetch } from "@/lib/apiFetch";
import { joinUrl } from "@/lib/url";
import logger from "@/lib/logger";
import { useToast } from "@/components/ui/ToastProvider";

export interface HiburanTopUpProps {
  hiburans: Hiburan[];
  isHome?: boolean;
}

export default function HiburanTopUp({ hiburans, isHome = false }: HiburanTopUpProps) {
  const { fetchCart, fetchQuantity } = useCart();
  const toast = useToast();
  const [selected, setSelected] = useState<Hiburan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [target, setTarget] = useState("");
  const [selectedPkg, setSelectedPkg] = useState<HiburanPackage | null>(null);
  const [packages, setPackages] = useState<HiburanPackage[]>([]);
  const [loadingPkgs, setLoadingPkgs] = useState(false);

  useEffect(() => {
    // reset when opening a new item or closing
    setTarget("");
    setSelectedPkg(null);
    setPackages([]);
    let aborted = false;
    const load = async () => {
      if (!selected?.slug) return;
      try {
        setLoadingPkgs(true);
        const res = await apiFetch(`api/v1/entertainments/${selected.slug}/packages`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const json = await res.json();
        if (json?.status === "success") {
          const list: HiburanPackage[] = json?.data?.packages ?? [];
          if (!aborted) setPackages(list);
        }
      } catch (e) {
        logger.error("Load entertainment packages failed", e);
      } finally {
        if (!aborted) setLoadingPkgs(false);
      }
    };
    if (selected) load();
    return () => { aborted = true; };
  }, [selected]);

  const handleTopUp = async (pkg: HiburanPackage, target: string) => {
    if (!pkg || !target.trim()) return;
    setIsProcessing(true);
    try {
      const token = await getCartToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) headers["X-Cart-Token"] = token;
      const res = await apiFetch(joinUrl(process.env.BACKEND_API_BASE_URL, 'api/v1/cart/add'), {
        method: "POST",
        credentials: "include",
        headers,
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
        toast.success("Berhasil ditambahkan ke keranjang.");
        setSelected(null);
      }
    } catch (e) {
      logger.error(e);
      toast.error("Gagal menambahkan ke keranjang. Silakan coba lagi.");
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

      <ProductModal
        open={!!selected}
        onClose={() => setSelected(null)}
        product={{
          logo: selected?.logo || "",
          name: selected?.name || "",
          description: selected?.description,
          label: selected?.label || "Target",
          placeholder: selected?.placeholder || "",
        }}
        target={target}
        onTargetChange={setTarget}
        errorMessages={formErrors.target ?? []}
        groups={[{ key: "default", label: "Paket", packages: ((packages || []) as unknown as CommonPackage[]) }]}
        activeGroupKey="default"
        selectedPackage={selectedPkg as unknown as CommonPackage}
        onSelectPackage={(p) => setSelectedPkg(p as HiburanPackage)}
        submitting={isProcessing || loadingPkgs}
        packagesLoading={loadingPkgs}
        onConfirm={() => { if (selectedPkg && target.trim()) handleTopUp(selectedPkg, target); }}
        confirmText="Add to Cart"
        size="xl"
        layout="wide"
      />
    </section>
  );
}
