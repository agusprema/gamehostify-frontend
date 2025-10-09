import React from "react";
import FormError from "@/components/ui/FormError";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string | string[];
  containerClassName?: string;
}

export default function Textarea({
  label,
  hint,
  error,
  className = "",
  containerClassName = "",
  ...rest
}: TextareaProps) {
  const hasError = Boolean(
    (Array.isArray(error) ? error.length > 0 : error)
  );

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-black dark:text-white mb-1">
          {label}
        </label>
      )}
      <textarea
        {...rest}
        className={
          `w-full rounded-xl px-4 py-3 border bg-gray-100 text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white transition ` +
          (hasError ? "border-red-500" : "border-gray-300") +
          (className ? ` ${className}` : "")
        }
        aria-invalid={hasError}
      />
      {hint && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
      {hasError && (
        <FormError
          className="mt-1"
          messages={Array.isArray(error) ? error : error ? [error] : []}
        />
      )}
    </div>
  );
}

