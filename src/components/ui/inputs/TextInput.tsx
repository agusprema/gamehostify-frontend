import React from "react";
import FormError from "@/components/ui/FormError";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessages?: string[];
}

export default function TextInput({ label, errorMessages = [], className = "", ...rest }: TextInputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      )}
      <input
        {...rest}
        className={`w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
        aria-invalid={errorMessages.length > 0}
      />
      <FormError messages={errorMessages} />
    </div>
  );
}

