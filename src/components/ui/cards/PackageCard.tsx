import React from "react";
import type { CommonPackage } from "@/components/ui/Modal/types";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/utils/formatPrice";

interface PackageCardProps {
  pkg: CommonPackage;
  selected?: boolean;
  onClick?: () => void;
}

export default function PackageCard({ pkg, selected = false, onClick }: PackageCardProps) {
  return (
    <button
      onClick={onClick}
      className={`p-4 border rounded-xl text-left transition ${
        selected ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10" : "border-gray-300 dark:border-gray-700 hover:border-primary-400/40 cursor-pointer"
      }`}
      aria-pressed={selected}
    >
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-800 dark:text-white">{pkg.name}</p>
        {pkg.is_popular && <Badge>Populer</Badge>}
      </div>
      {pkg.amount && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{pkg.amount}</p>
      )}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-primary-600 dark:text-primary-400 font-bold">
          {formatPrice(pkg.final_price)}
        </span>
        {pkg.original_price && pkg.original_price > pkg.final_price && (
          <span className="text-gray-400 line-through text-xs">
            {formatPrice(pkg.original_price)}
          </span>
        )}
      </div>
      {pkg.metadata?.bonus && (
        <p className="text-green-500 dark:text-green-400 text-xs font-medium mt-1">+ {pkg.metadata.bonus} Bonus</p>
      )}
    </button>
  );
}
