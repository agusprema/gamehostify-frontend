import React from "react";
import FormError from "@/components/ui/FormError";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string | string[];
  containerClassName?: string;
}

export default function Checkbox({
  label,
  description,
  error,
  className = "",
  containerClassName = "",
  ...rest
}: CheckboxProps) {
  const hasError = Boolean(
    (Array.isArray(error) ? error.length > 0 : error)
  );

  return (
    <div className={containerClassName}>
      <label className="flex items-start gap-3 select-none">
        <input
          {...rest}
          type="checkbox"
          className={
            `mt-1 h-5 w-5 rounded border bg-white dark:bg-gray-800 text-primary-600 focus:ring-primary-500 focus:outline-none dark:border-gray-600 ` +
            (hasError ? "border-red-500" : "border-gray-300") +
            (className ? ` ${className}` : "")
          }
          aria-invalid={hasError}
        />
        <span>
          {label && (
            <span className="block text-sm font-medium text-gray-900 dark:text-white">{label}</span>
          )}
          {description && (
            <span className="block text-xs text-gray-600 dark:text-gray-400">{description}</span>
          )}
        </span>
      </label>
      {hasError && (
        <FormError
          className="mt-1"
          messages={Array.isArray(error) ? error : error ? [error] : []}
        />
      )}
    </div>
  );
}

