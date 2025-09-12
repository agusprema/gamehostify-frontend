"use client";
import React, { useState, useMemo, useEffect, useId } from "react";
import { useForm } from "react-hook-form";
import { setFieldErrors } from "@/utils/rhf/setFieldErrors";
import { motion, AnimatePresence } from "framer-motion";
import { Operator, OperatorPackage } from "../types";
import PulsaModalHeader from "./PulsaModalHeader";
import PulsaModalPhoneInput from "./PulsaModalPhoneInput";
import PulsaModalTabs from "./PulsaModalTabs";
import PulsaModalPackages from "./PulsaModalPackages";
import PulsaModalFooter from "./PulsaModalFooter";

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

  // RHF instance to enable setFieldErrors for server errors
  const { setError, setValue, formState: { errors } } = useForm<{ target: string }>({
    defaultValues: { target: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

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

  // Sync local phone to RHF for validation state
  useEffect(() => {
    setValue("target", phone, { shouldDirty: true, shouldValidate: true });
  }, [phone, setValue]);

  // Apply server-side field errors via RHF
  useEffect(() => {
    if (formErrors) {
      setFieldErrors(setError as any, formErrors as any, ["target"] as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formErrors]);

  const handleConfirm = async () => {
    if (!selectedPkg || !phone.trim()) return;
    await onSubmit(selectedPkg, phone.trim());
  };

  if (!isOpen || !operator) return null;

  // Accessibility: unique ids for modal title/desc
  const modalTitleId = `pulsa-modal-title-${inputId}`;
  const modalDescId = `pulsa-modal-desc-${inputId}`;

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
          aria-labelledby={modalTitleId}
          aria-describedby={modalDescId}
          tabIndex={-1}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          />
          
          {/* Modal Content */}
          <motion.div
            className="relative z-10 w-full max-w-xl rounded-2xl border border-gray-300 dark:border-primary-500/20 
                       bg-white dark:bg-gray-900 shadow-lg p-8 transition-colors"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            {/* Modal header should use the modalTitleId for aria-labelledby */}
            <div id={modalTitleId} className="sr-only">Isi Pulsa & Paket Data</div>
            <div id={modalDescId} className="sr-only">Formulir pembelian pulsa dan paket data untuk operator terpilih.</div>
            <PulsaModalHeader operator={operator} selectedPkg={selectedPkg} onClose={onClose} />
            <PulsaModalPhoneInput
              phone={phone}
              setPhone={setPhone}
              inputId={inputId}
              formError={errors.target?.message ? { target: [String(errors.target.message)] } : formErrors}
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
