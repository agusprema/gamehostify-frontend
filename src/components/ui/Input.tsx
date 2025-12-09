import React, { forwardRef, useId } from "react";
import FormError from "@/components/ui/FormError";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string | string[];
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  variant?: "solid" | "glass";
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    leftIcon,
    rightIcon,
    className = "",
    containerClassName = "",
    variant = "glass",
    ...rest
  }: InputProps,
  ref
) {
  const hasError = Boolean(
    (Array.isArray(error) ? error.length > 0 : error)
  );

  const paddingLeft = leftIcon ? "pl-10" : "";
  const paddingRight = rightIcon ? "pr-10" : "";

  // Ensure label is associated to input for SEO/accessibility
  const reactId = useId();
  const inputId = (rest as { id?: string }).id ?? reactId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = hasError ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ");

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-black dark:text-white mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute inset-y-0 left-3 flex items-center text-primary-500">
            {leftIcon}
          </span>
        )}
        <input
          {...rest}
          id={inputId}
          ref={ref}
          className={
            [
              "w-full rounded-xl px-4 py-3",
              paddingLeft,
              paddingRight,
              variant === "glass"
                ? [
                    "bg-white/10 dark:bg-white/5",
                    "backdrop-blur-sm",
                    "border",
                    hasError ? "border-red-500/60" : "border-white/20 dark:border-white/10",
                    "text-gray-900 dark:text-white",
                    "placeholder-gray-500/80 dark:placeholder-gray-400/70",
                    "focus:border-primary-400/70 focus:ring-0 focus:outline-none",
                  ].join(" ")
                : [
                    "border",
                    hasError ? "border-red-500" : "border-gray-300",
                    "bg-gray-100 text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white",
                  ].join(" "),
              "transition",
              className,
            ].join(" ")
          }
          aria-invalid={hasError}
          aria-describedby={describedBy || undefined}
        />
        {rightIcon && (
          <span className="absolute inset-y-0 right-3 flex items-center text-primary-500">
            {rightIcon}
          </span>
        )}
      </div>
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
      {hasError && (
        <div id={errorId}>
          <FormError
            className="mt-1"
            messages={Array.isArray(error) ? error : error ? [error] : []}
          />
        </div>
      )}
    </div>
  );
});

export default Input;
