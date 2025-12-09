"use client";

import React from "react";

type FormProps = React.FormHTMLAttributes<HTMLFormElement> & {
  error?: string | null;
  success?: string | null;
  spaced?: boolean;
};

export default function Form({
  children,
  className = "",
  error,
  success,
  spaced = true,
  ...rest
}: FormProps) {
  return (
    <form
      {...rest}
      className={(spaced ? "space-y-5 " : "") + className}
    >
      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          {success}
        </div>
      )}
      {children}
    </form>
  );
}

