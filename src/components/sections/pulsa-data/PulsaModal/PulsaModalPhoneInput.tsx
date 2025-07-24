import React from "react";
import { Operator } from "../types";
import FormError from "@/components/ui/FormError";

interface PulsaModalPhoneInputProps {
  phone: string;
  setPhone: (value: string) => void;
  inputId: string;
  formError?: Record<string, string[]>;
  operator: Operator;
}

export default function PulsaModalPhoneInput({
  phone,
  setPhone,
  inputId,
  formError,
  operator,
}: PulsaModalPhoneInputProps) {
  const label = operator?.label ?? "Nomor HP";
  const placeholder = operator?.placeholder ?? "08xxxxxxxxxx";

  // Validasi sederhana untuk hanya angka (0-9)
  const handleChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    setPhone(cleaned);
  };

  return (
    <div className="mb-6">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
      >
        {label}
      </label>
      <input
        id={inputId}
        type="tel"
        inputMode="numeric"
        placeholder={placeholder}
        value={phone}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary-400 focus:ring-1 focus:ring-primary-400 px-4 py-2 text-gray-900 dark:text-white text-sm transition"
      />
      {formError?.target && <FormError messages={formError.target} />}
    </div>
  );
}
