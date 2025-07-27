import React from "react";
import { OperatorPackage } from "../types";
import { formatIDR } from "./utils";

interface PulsaModalPackagesProps {
  currentPackages: OperatorPackage[];
  selectedPkg: OperatorPackage | null;
  setSelectedPkg: (p: OperatorPackage) => void;
}

export default function PulsaModalPackages({
  currentPackages,
  selectedPkg,
  setSelectedPkg,
}: PulsaModalPackagesProps) {
  return (
    <div className="max-h-72 overflow-y-auto pr-1 custom-scrollbar mb-6">
      {currentPackages.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">
          Tidak ada paket.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="listbox" aria-label="Pilih Paket Pulsa/Data">
          {currentPackages.map((p) => {
            const isSelected = selectedPkg?.id === p.id;
            const buttonClass = isSelected
              ? "border-primary-400 bg-primary-500/10"
              : "border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/60 hover:border-primary-400/40 cursor-pointer";

            return (
              <li key={p.id} role="option" aria-selected={isSelected} tabIndex={0}>
                <button
                  type="button"
                  onClick={() => setSelectedPkg(p)}
                  className={`w-full flex items-center justify-between rounded-lg px-4 py-3 border text-left transition ${buttonClass}`}
                  aria-label={`Pilih paket ${p.name} seharga ${formatIDR(p.final_price)}`}
                  aria-pressed={isSelected}
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {p.name}
                  </span>
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-300">
                    {formatIDR(p.final_price)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
