"use client";
import React, { useEffect, useId, useState } from "react";
import Image from "next/image";
import { Hiburan, HiburanPackage } from "./types";
import Modal from "@/components/ui/Modal";

interface HiburanModalProps {
  hiburan: Hiburan | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pkg: HiburanPackage, target: string) => Promise<void> | void;
  submitting?: boolean;
  formErrors?: Record<string, string[]>;
}

export function HiburanModal({
  hiburan,
  isOpen,
  onClose,
  onSubmit,
  submitting,
  formErrors,
}: HiburanModalProps) {
  const [target, setTarget] = useState("");
  const [selectedPkg, setSelectedPkg] = useState<HiburanPackage | null>(null);
  const inputId = useId();

  useEffect(() => {
    setTarget("");
    setSelectedPkg(null);
  }, [hiburan]);

  const handleConfirm = async () => {
    if (!selectedPkg || !target.trim()) return;
    await onSubmit(selectedPkg, target.trim());
  };

  if (!isOpen || !hiburan) return null;

  const error = formErrors?.target?.[0];
  const titleId = `hib-modal-title-${inputId}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      containerClassName="max-w-xl p-8"
      ariaLabelledby={titleId}
    >
      <>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <Image src={hiburan.logo} alt={hiburan.name} fill className="rounded-xl object-contain" />
            </div>
            <div>
              <h3 id={titleId} className="text-xl font-semibold text-gray-900 dark:text-white">
                {hiburan.name}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{hiburan.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {hiburan.label}
          </label>
          <input
            id={inputId}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={hiburan.placeholder}
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-invalid={!!error}
          />
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 max-h-64 overflow-y-auto pr-2">
          {hiburan.packages.map((pkg) => (
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
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Rp {pkg.final_price.toLocaleString("id-ID")}
              </p>
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleConfirm}
            disabled={submitting || !selectedPkg || !target.trim()}
            className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-700 disabled:opacity-50"
          >
            {submitting ? "Processing..." : "Add to Cart"}
          </button>
        </div>
      </>
    </Modal>
  );
}

