"use client";
import React, { useState, useMemo, useEffect, useId } from "react";
import { Operator, OperatorPackage } from "../types";
import PulsaModalHeader from "./PulsaModalHeader";
import PulsaModalPhoneInput from "./PulsaModalPhoneInput";
import PulsaModalTabs from "./PulsaModalTabs";
import PulsaModalPackages from "./PulsaModalPackages";
import PulsaModalFooter from "./PulsaModalFooter";
import Modal from "@/components/ui/Modal";

interface PulsaModalProps {
  operator: Operator | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pkg: OperatorPackage, phone: string) => Promise<void> | void;
  submitting?: boolean;
  formErrors?: Record<string, string[]>;
}

export function PulsaModal({
  operator,
  isOpen,
  onClose,
  onSubmit,
  submitting,
  formErrors,
}: PulsaModalProps) {
  const [tab, setTab] = useState<"pulsa" | "data">("pulsa");
  const [phone, setPhone] = useState("");
  const [selectedPkg, setSelectedPkg] = useState<OperatorPackage | null>(null);
  const inputId = useId();

  const pulsaPackages = useMemo(
    () => operator?.packages.filter((p) => p.type_package === "pulsa") ?? [],
    [operator]
  );
  const dataPackages = useMemo(
    () => operator?.packages.filter((p) => p.type_package === "data") ?? [],
    [operator]
  );
  const currentPackages = tab === "pulsa" ? pulsaPackages : dataPackages;

  useEffect(() => {
    setPhone("");
    setSelectedPkg(null);
    setTab("pulsa");
  }, [operator]);

  useEffect(() => {
    if (selectedPkg) setTab(selectedPkg.type_package === "data" ? "data" : "pulsa");
  }, [selectedPkg]);

  const handleConfirm = async () => {
    if (!selectedPkg || !phone.trim()) return;
    await onSubmit(selectedPkg, phone.trim());
  };

  if (!isOpen || !operator) return null;

  // Accessibility: unique ids for modal title/desc
  const modalTitleId = `pulsa-modal-title-${inputId}`;
  const modalDescId = `pulsa-modal-desc-${inputId}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      containerClassName="max-w-xl p-8"
      ariaLabelledby={modalTitleId}
      ariaDescribedby={modalDescId}
    >
      <>
        <div id={modalTitleId} className="sr-only">Isi Pulsa & Paket Data</div>
        <div id={modalDescId} className="sr-only">Formulir pembelian pulsa dan paket data untuk operator terpilih.</div>
        <PulsaModalHeader operator={operator} selectedPkg={selectedPkg} onClose={onClose} />
        <PulsaModalPhoneInput
          phone={phone}
          setPhone={setPhone}
          inputId={inputId}
          formError={formErrors}
          operator={operator}
        />
        <PulsaModalTabs tab={tab} setTab={setTab} />

        <PulsaModalPackages
          currentPackages={currentPackages}
          selectedPkg={selectedPkg}
          setSelectedPkg={setSelectedPkg}
        />

        <PulsaModalFooter
          submitting={submitting}
          selectedPkg={selectedPkg}
          phone={phone}
          handleConfirm={handleConfirm}
        />
      </>
    </Modal>
  );
}

