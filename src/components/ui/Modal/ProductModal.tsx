"use client";

import React from "react";
import Image from "next/image";
import { Package as PackageIcon, User, X } from "lucide-react";
import BaseModal from "./BaseModal";
// FormError handled by TextInput where used
import { CommonPackage, PackageGroup } from "./types";
import SegmentedTabs from "@/components/ui/SegmentedTabs";
import PackageCard from "@/components/ui/cards/PackageCard";
import TextInput from "@/components/ui/inputs/TextInput";
import { formatPrice } from "@/utils/formatPrice";

export interface ProductInfo {
  logo: string;
  name: string;
  category?: string;
  description?: string;
  label: string;
  placeholder: string;
}

// PackageGroup now imported from ./types

type Layout = "compact" | "wide"; // compact: single column; wide: with summary sidebar

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl";
  layout?: Layout;

  product: ProductInfo;
  target: string;
  onTargetChange: (val: string) => void;
  errorMessages?: string[];

  groups: PackageGroup[];
  activeGroupKey?: string;
  onGroupChange?: (key: string) => void;

  selectedPackage: CommonPackage | null;
  onSelectPackage: (p: CommonPackage) => void;

  submitting?: boolean;
  onConfirm: () => void;
  confirmText?: string;
}

export default function ProductModal({
  open,
  onClose,
  size = "md",
  layout = "compact",
  product,
  target,
  onTargetChange,
  errorMessages = [],
  groups,
  activeGroupKey,
  onGroupChange,
  selectedPackage,
  onSelectPackage,
  submitting,
  onConfirm,
  confirmText = "Add to Cart",
}: ProductModalProps) {
  const titleId = React.useId();

  const activeKey = activeGroupKey ?? groups[0]?.key;
  const activeGroup = groups.find((g) => g.key === activeKey) ?? groups[0];

  const hasTabs = groups.length > 1;

  const onChangeNumeric = (value: string) => {
    // allow non-numeric targets for games; we only sanitize if looks like phone
    if (/^[0-9+\s-]*$/.test(value) || value.length < target.length) {
      onTargetChange(value.replace(/[^0-9+]/g, ""));
    } else {
      onTargetChange(value);
    }
  };

  return (
    <BaseModal open={open} onClose={onClose} size={layout === "wide" ? "xl" : size} ariaLabelledby={titleId}>
      {/* Header */}
      <div className="flex items-center justify-between -m-6 mb-0 p-5 border-b bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-t-2xl">
        <div className="flex items-center gap-4">
          <Image src={product.logo} alt={product.name} width={200} height={200} className="w-14 h-14 rounded-lg object-contain" />
          <div>
            <h2 id={titleId} className="text-xl font-bold text-gray-900 dark:text-white">{product.name}</h2>
            {(product.category || product.description) && (
              <span className="block text-primary-600 dark:text-primary-400 text-sm line-clamp-1">
                {product.category ?? product.description}
              </span>
            )}
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition cursor-pointer" aria-label="Close">
          <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Content */}
      {layout === "wide" ? (
        <div className="grid lg:grid-cols-3 gap-6 p-5">
          {/* Packages area */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <PackageIcon className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" /> Pilih Paket
            </h3>

            {hasTabs && (
              <SegmentedTabs
                items={groups.map((g) => ({ key: g.key, label: g.label }))}
                activeKey={activeKey!}
                onChange={(k) => onGroupChange?.(k)}
                className="mb-3"
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2 pt-2 custom-scrollbar">
              {activeGroup?.packages?.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  selected={selectedPackage?.id === pkg.id}
                  onClick={() => onSelectPackage(pkg)}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" /> {product.label}
            </h3>
            <TextInput
              value={target}
              onChange={(e) => onTargetChange((e.target as HTMLInputElement).value)}
              placeholder={product.placeholder}
              className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3"
              errorMessages={errorMessages}
            />

            {selectedPackage && (
              <div className="border-t border-gray-300 dark:border-gray-600 pt-4 mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Produk:</span>
                  <span className="text-gray-900 dark:text-white">{product.name}</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Paket:</span>
                  <span className="text-gray-900 dark:text-white">{selectedPackage.name}</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Total:</span>
                  <span className="text-primary-600 dark:text-primary-400 font-bold">{formatPrice(selectedPackage.final_price)}</span>
                </div>
              </div>
            )}

            <button
              onClick={onConfirm}
              disabled={!selectedPackage || !target || !!submitting}
              className="w-full mt-6 py-3 rounded-lg font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6">
          <div className="mb-4">
            <TextInput
              label={product.label}
              value={target}
              onChange={(e) => onChangeNumeric((e.target as HTMLInputElement).value)}
              placeholder={product.placeholder}
              errorMessages={errorMessages}
            />
          </div>

          {hasTabs && (
            <SegmentedTabs
              items={groups.map((g) => ({ key: g.key, label: g.label }))}
              activeKey={activeKey!}
              onChange={(k) => onGroupChange?.(k)}
              className="mb-4"
            />
          )}

          <div className="max-h-72 overflow-y-auto pr-1 custom-scrollbar mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeGroup?.packages?.map((p) => (
              <PackageCard
                key={p.id}
                pkg={p}
                selected={selectedPackage?.id === p.id}
                onClick={() => onSelectPackage(p)}
              />
            ))}
          </div>

          <button
            onClick={onConfirm}
            disabled={!selectedPackage || !target || !!submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-base transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Processing..." : confirmText}
          </button>
        </div>
      )}
    </BaseModal>
  );
}
