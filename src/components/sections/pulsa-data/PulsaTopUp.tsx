"use client";
import React, { useState, useMemo, useEffect, useId } from "react";
import { Operator, OperatorPackage } from "./types";
import { useCart } from "@/contexts/CartContext";
import { getCartToken } from "@/lib/cart/getCartToken";
import { OperatorGrid } from "./OperatorGrid";
import { handleApiErrors } from "@/utils/apiErrorHandler";
import Link from "@/components/ui/Link";
import PulsaModalHeader from "./PulsaModal/PulsaModalHeader";
import PulsaModalPhoneInput from "./PulsaModal/PulsaModalPhoneInput";
import PulsaModalTabs from "./PulsaModal/PulsaModalTabs";
import PulsaModalPackages from "./PulsaModal/PulsaModalPackages";
import PulsaModalFooter from "./PulsaModal/PulsaModalFooter";
import Modal from "@/components/ui/Modal";

export interface PulsaTopUpProps {
  operators: Operator[];
  isHome?: boolean;
}

const PulsaTopUp: React.FC<PulsaTopUpProps> = ({ operators, isHome = false }) => {
  const { fetchCart, fetchQuantity } = useCart();
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [tab, setTab] = useState<"pulsa" | "data">("pulsa");
  const [phone, setPhone] = useState("");
  const [selectedPkg, setSelectedPkg] = useState<OperatorPackage | null>(null);
  const inputId = useId();

  const pulsaPackages = useMemo(
    () => selectedOperator?.packages.filter((p) => p.type_package === "pulsa") ?? [],
    [selectedOperator]
  );
  const dataPackages = useMemo(
    () => selectedOperator?.packages.filter((p) => p.type_package === "data") ?? [],
    [selectedOperator]
  );
  const currentPackages = tab === "pulsa" ? pulsaPackages : dataPackages;

  useEffect(() => {
    setPhone("");
    setSelectedPkg(null);
    setTab("pulsa");
  }, [selectedOperator]);

  useEffect(() => {
    if (selectedPkg)
      setTab(selectedPkg.type_package === "data" ? "data" : "pulsa");
  }, [selectedPkg]);

  const handleConfirm = async () => {
    if (!selectedPkg || !phone.trim()) return;
    await handleTopUp(selectedPkg, phone.trim());
  };

  const modalTitleId = `pulsa-modal-title-${inputId}`;
  const modalDescId = `pulsa-modal-desc-${inputId}`;

  const handleTopUp = async (pkg: OperatorPackage, phone: string) => {
    if (!pkg || !phone.trim()) return;
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
          target: phone.trim(),
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
        setSelectedOperator(null);
      }
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

      {selectedOperator && (
        <Modal
          isOpen={!!selectedOperator}
          onClose={() => setSelectedOperator(null)}
          containerClassName="max-w-xl p-8"
          ariaLabelledby={modalTitleId}
          ariaDescribedby={modalDescId}
        >
          <>
            <div id={modalTitleId} className="sr-only">Isi Pulsa & Paket Data</div>
            <div id={modalDescId} className="sr-only">Formulir pembelian pulsa dan paket data untuk operator terpilih.</div>
            <PulsaModalHeader operator={selectedOperator} selectedPkg={selectedPkg} onClose={() => setSelectedOperator(null)} />
            <PulsaModalPhoneInput
              phone={phone}
              setPhone={setPhone}
              inputId={inputId}
              formError={formErrors}
              operator={selectedOperator}
            />
            <PulsaModalTabs tab={tab} setTab={setTab} />
            <PulsaModalPackages
              currentPackages={currentPackages}
              selectedPkg={selectedPkg}
              setSelectedPkg={setSelectedPkg}
            />
            <PulsaModalFooter
              submitting={isProcessing}
              selectedPkg={selectedPkg}
              phone={phone}
              handleConfirm={handleConfirm}
            />
          </>
        </Modal>
      )}
    </section>
  );
};

export default PulsaTopUp;
