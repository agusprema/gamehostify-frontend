import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "solid" | "glass";
};

export default function Card({
  title,
  description,
  footer,
  variant = "glass",
  className = "",
  children,
  ...rest
}: CardProps) {
  const base = "rounded-xl p-6 shadow-sm ";
  const solid = "border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900";
  const glass = [
    "bg-white/10 dark:bg-gray-900/30",
    "backdrop-blur-md",
    "border border-white/20 dark:border-white/10",
    "shadow-lg ring-1 ring-white/10",
  ].join(" ");

  return (
    <div
      {...rest}
      className={`${base} ${variant === "glass" ? glass : solid} ${className}`}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
          )}
        </div>
      )}
      <div>{children}</div>
      {footer && (
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          {footer}
        </div>
      )}
    </div>
  );
}
