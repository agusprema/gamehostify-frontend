"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { setFieldErrors } from "@/utils/rhf/setFieldErrors";
import ProductModal from "@/components/ui/Modal/ProductModal";
import { CommonPackage, PackageGroup } from "@/components/ui/Modal/types";
import { Operator, OperatorPackage } from "../types";
import { apiFetch } from "@/lib/apiFetch";
import logger from "@/lib/logger";

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
  const [loadingPkgs, setLoadingPkgs] = useState(false);
  const [pkgError, setPkgError] = useState<string | null>(null);
  const [packages, setPackages] = useState<OperatorPackage[]>([]);
  // const inputId = useId();

  // RHF instance to enable setFieldErrors for server errors
  const { setError, setValue, formState: { errors } } = useForm<{ target: string }>({
    defaultValues: { target: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const pulsaPackages = useMemo(
    () => packages.filter((p) => p.type_package === "pulsa"),
    [packages]
  );
  const dataPackages = useMemo(
    () => packages.filter((p) => p.type_package === "data"),
    [packages]
  );
  // const currentPackages = tab === "pulsa" ? pulsaPackages : dataPackages;

  useEffect(() => {
    setPhone("");
    setSelectedPkg(null);
    setTab("pulsa");
    setPackages([]);
    setPkgError(null);
    let aborted = false;
    const load = async () => {
      if (!isOpen || !operator?.slug) return;
      try {
        setLoadingPkgs(true);
        const res = await apiFetch(`api/v1/operators/${operator.slug}/packages`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const json = await res.json();
        if (json?.status === "success") {
          const list: OperatorPackage[] = json?.data?.packages ?? [];
          if (!aborted) setPackages(list);
        } else {
          if (!aborted) setPkgError(json?.message || "Gagal memuat paket");
        }
      } catch (e) {
        logger.error("Load operator packages failed", e);
        if (!aborted) setPkgError("Gagal memuat paket");
      } finally {
        if (!aborted) setLoadingPkgs(false);
      }
    };
    load();
    return () => {
      aborted = true;
    };
  }, [operator, isOpen]);

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
      setFieldErrors<{ target: string }>(setError, formErrors, ["target"]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formErrors]);

  const handleConfirm = async () => {
    if (!selectedPkg || !phone.trim()) return;
    await onSubmit(selectedPkg, phone.trim());
  };

  if (!isOpen || !operator) return null;

  // Accessibility: unique ids for modal title/desc
  // const modalTitleId = `pulsa-modal-title-${inputId}`;
  // const modalDescId = `pulsa-modal-desc-${inputId}`;

  const groups: PackageGroup[] = [
    { key: "pulsa", label: "Pulsa", packages: (pulsaPackages as unknown as CommonPackage[]) },
    { key: "data", label: "Data", packages: (dataPackages as unknown as CommonPackage[]) },
  ];

  return (
    <ProductModal
      open={!!isOpen && !!operator}
      onClose={onClose}
      product={{
        logo: operator?.logo || "",
        name: operator?.name || "",
        description: operator?.description,
        label: operator?.label ?? "Nomor HP",
        placeholder: operator?.placeholder ?? "08xxxxxxxxxx",
      }}
      target={phone}
      onTargetChange={setPhone}
      errorMessages={(errors.target?.message ? [String(errors.target.message)] : (formErrors?.target ?? []))}
      groups={groups}
      activeGroupKey={tab}
      onGroupChange={(k) => setTab(k as "pulsa" | "data")}
      selectedPackage={selectedPkg as unknown as CommonPackage}
      onSelectPackage={(p) => setSelectedPkg(p as OperatorPackage)}
      submitting={submitting || loadingPkgs}
      packagesLoading={loadingPkgs}
      onConfirm={handleConfirm}
      confirmText="Tambah ke Keranjang"
      size="xl"
      layout="wide"
    />
  );
}
