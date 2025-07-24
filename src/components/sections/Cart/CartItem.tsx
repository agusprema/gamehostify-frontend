"use client";

import React, { useMemo, useCallback } from "react";
import { Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import type { BaseCartItem } from "./types";

interface CartItemProps {
  item: BaseCartItem;
  removing: string | null; // id package yang sedang dihapus
  onRemove: (id: string) => void;
}

const CartItem = React.memo(function CartItem({ item, removing, onRemove }: CartItemProps) {
  const totalPkgQty = useMemo(() => {
    return item.packages?.items?.reduce((acc, it) => acc + (it.quantity ?? 0), 0) ?? 0;
  }, [item.packages?.items]);

  const created = useMemo(() => {
    return item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID") : "-";
  }, [item.createdAt]);

  const pkgRows = useMemo(() => {
    const price = item.packages?.price ?? 0;
    return (item.packages?.items ?? []).map((entry, idx) => ({
      key: entry.id ?? idx,
      id: entry.id,
      target: entry.target,
      quantity: entry.quantity,
      priceFormatted: `Rp${(price * entry.quantity).toLocaleString("id-ID")}`,
    }));
  }, [item.packages?.price, item.packages?.items]);

  const handleRemove = useCallback(
    (pkgId: string) => {
      onRemove(pkgId);
    },
    [onRemove]
  );

  return (
    <div
      className="
        rounded-xl p-5
        bg-gray-100 dark:bg-gray-800/50 backdrop-blur-[2px]
        border border-gray-300 dark:border-gray-700/80
        shadow-sm hover:shadow-primary-500/10
        transition
      "
    >
      {/* Top row */}
      <div className="flex items-start gap-4">
        <Image
          src={item.image}
          alt={item.name}
          width={80}
          height={80}
          loading="lazy"
          sizes="80px"
          className="w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 dark:text-white font-semibold text-base truncate">
            {item.name}
          </h3>
          <span className="text-primary-600 dark:text-primary-400 text-xs uppercase tracking-wide">
            {item.packages?.name ?? "No Package"}
          </span>
          <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
            Total Qty: {totalPkgQty}
          </p>
        </div>
      </div>

      {/* Package Details */}
      <div className="mt-4 rounded-lg bg-gray-50 dark:bg-gray-900/40 p-3 border border-gray-300 dark:border-gray-700/80">
        <div className="grid grid-cols-4 text-xs text-gray-600 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
          <span>Target</span>
          <span className="text-center">Qty</span>
          <span className="text-right">Price</span>
          <span className="text-right">Action</span>
        </div>
        {pkgRows.length ? (
          pkgRows.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-4 text-sm text-gray-900 dark:text-white py-1 border-b border-gray-200 dark:border-gray-800 last:border-none items-center"
            >
              <span className="truncate">{row.target}</span>
              <span className="text-center">{row.quantity}</span>
              <span className="text-right">{row.priceFormatted}</span>
              <button
                onClick={() => handleRemove(row.id)}
                disabled={removing === row.id}
                className="
                  p-1 rounded-md ml-auto
                  text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400
                  hover:bg-gray-200 dark:hover:bg-gray-800/70
                  transition-transform active:scale-90
                  disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                "
                aria-label="Remove package"
              >
                {removing === row.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-red-500 dark:text-red-400" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-xs">Tidak ada data paket</p>
        )}
      </div>

      {/* Meta */}
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Dibuat: {created}</p>
    </div>
  );
});

export default CartItem;
