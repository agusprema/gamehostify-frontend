import React from "react";
import { Loader2 } from "lucide-react";
import { OperatorPackage } from "../types";

export default function PulsaModalFooter({
  submitting,
  selectedPkg,
  phone,
  handleConfirm,
}: {
  submitting?: boolean;
  selectedPkg: OperatorPackage | null;
  phone: string;
  handleConfirm: () => void;
}) {
  const isDisabled = !selectedPkg || !phone.trim() || submitting;

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={submitting ? "true" : undefined}
      aria-live="polite"
      onClick={handleConfirm}
      className={`w-full ${
        isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-base transition`}
      aria-label={submitting ? "Sedang menambah ke keranjang" : "Tambah ke Keranjang"}
    >
      {submitting && <>
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
        <span className="sr-only">Sedang menambah ke keranjang...</span>
      </>}
      {!submitting && "Tambah ke Keranjang"}
    </button>
  );
}
