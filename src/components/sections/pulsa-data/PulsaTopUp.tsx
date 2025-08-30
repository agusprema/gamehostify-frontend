"use client";
import React, { useState } from "react";
import { PulsaModal } from "./PulsaModal/PulsaModal";
import { Operator, OperatorPackage } from "./types";
import { useCart } from "@/contexts/CartContext";
import { OperatorGrid } from "./OperatorGrid";
import Link from "@/components/ui/Link";

export interface PulsaTopUpProps {
  operators: Operator[];
  isHome?: boolean;
}

const PulsaTopUp: React.FC<PulsaTopUpProps> = ({ operators, isHome = false }) => {
  const { addToCart } = useCart();
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const handleTopUp = async (pkg: OperatorPackage, phone: string) => {
    if (!pkg || !phone.trim()) return;
    setIsProcessing(true);
    try {
      const { success, errors } = await addToCart({
        purchasable_type: pkg.type,
        purchasable_id: pkg.id,
        target: phone.trim(),
        target_type: "phone",
        quantity: 1,
      });

      if (!success) {
        setFormErrors(errors || {});
        return;
      }

      setSelectedOperator(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="py-8" aria-label="Pulsa & Paket Data">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <OperatorGrid
          operators={operators}
          onSelect={(op) => {
            setSelectedOperator(op);
            setFormErrors({});
          }}
          isHome={isHome}
        />
      </div>

      {isHome && (
        <div className="mt-12 text-center">
          <Link
            href="/pulsa-data"
            className="group inline-flex items-center px-10 py-4 rounded-xl font-semibold 
              text-white dark:text-white bg-gradient-to-r from-primary-500 to-primary-700 
              hover:scale-105 transition"
            aria-label="Lihat semua produk pulsa dan data"
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

      <PulsaModal
        operator={selectedOperator}
        isOpen={!!selectedOperator}
        onClose={() => setSelectedOperator(null)}
        onSubmit={handleTopUp}
        submitting={isProcessing}
        formErrors={formErrors}
      />
    </section>
  );
};

export default PulsaTopUp;
