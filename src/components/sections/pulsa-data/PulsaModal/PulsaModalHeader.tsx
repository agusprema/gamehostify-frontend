import React from "react";
import { X } from "lucide-react";
import { Operator, OperatorPackage } from "../types";
import { formatIDR } from "./utils";
import Image from "next/image";

export default function PulsaModalHeader({
  operator,
  selectedPkg,
  onClose,
}: {
  operator: Operator;
  selectedPkg: OperatorPackage | null;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      {/* Gambar Logo */}
      <div className="relative w-12 h-12">
        <Image
          src={operator.logo}
          alt={`Logo operator ${operator.name}`}
          fill
          className="rounded-md object-contain"
        />
      </div>

      {/* Info Operator */}
      <div className="flex-1 min-w-0">
        <h2
          className="text-xl font-bold text-gray-900 dark:text-white"
          id="pulsa-modal-title"
        >
          {operator.name}
        </h2>

        {operator.description && (
          <p
            className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2"
            id="pulsa-modal-desc"
          >
            {operator.description}
          </p>
        )}

        {selectedPkg && (
          <div
            className="mt-2 inline-block rounded-md bg-primary-500/10 border border-primary-400/30 px-2 py-1 text-xs font-medium text-primary-600 dark:text-primary-300"
            aria-live="polite"
          >
            Paket dipilih: {selectedPkg.name} ({formatIDR(selectedPkg.final_price)})
          </div>
        )}
      </div>

      {/* Tombol Close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup Modal"
        title="Tutup Modal"
        className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
      >
        <X className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  );
}
