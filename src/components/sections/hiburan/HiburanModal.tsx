"use client";
import React, { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Hiburan, HiburanPackage } from "./types";

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`hib-modal-title-${inputId}`}
          aria-describedby={`hib-modal-desc-${inputId}`}
          tabIndex={-1}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          />

          <motion.div
            className="relative z-10 w-full max-w-xl rounded-2xl border border-gray-300 dark:border-primary-500/20
                       bg-white dark:bg-gray-900 shadow-lg p-8 transition-colors"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <Image src={hiburan.logo} alt={hiburan.name} fill className="rounded-xl object-contain" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{hiburan.name}</h3>
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
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                      : 'border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <p className="font-semibold text-gray-800 dark:text-white">{pkg.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Rp {pkg.final_price.toLocaleString('id-ID')}
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
                {submitting ? 'Processing...' : 'Add to Cart'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
