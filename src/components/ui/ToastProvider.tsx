"use client";

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // ms
}

interface ToastContextValue {
  show: (opts: Omit<ToastItem, "id">) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  remove: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function cls(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, number>>({});

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timerId = timers.current[id];
    if (timerId) {
      window.clearTimeout(timerId);
      delete timers.current[id];
    }
  }, []);

  const show = useCallback((opts: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const duration = typeof opts.duration === "number" ? opts.duration : 4000;
    const item: ToastItem = { id, ...opts, duration };
    setToasts((prev) => [...prev, item]);

    if (duration! > 0) {
      timers.current[id] = window.setTimeout(() => remove(id), duration);
    }
  }, [remove]);

  const success = useCallback((message: string, title?: string) => show({ type: "success", message, title }), [show]);
  const error = useCallback((message: string, title?: string) => show({ type: "error", message, title }), [show]);
  const info = useCallback((message: string, title?: string) => show({ type: "info", message, title }), [show]);
  const warning = useCallback((message: string, title?: string) => show({ type: "warning", message, title }), [show]);

  const value = useMemo<ToastContextValue>(() => ({ show, success, error, info, warning, remove }), [show, success, error, info, warning, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cls(
              "pointer-events-auto w-80 max-w-[90vw] rounded-lg shadow-lg border p-3 pr-8 relative",
              "bg-white/90 dark:bg-gray-900/90 backdrop-blur",
              "border-gray-200 dark:border-gray-800",
              t.type === "success" && "border-green-200 dark:border-green-900/50",
              t.type === "error" && "border-red-200 dark:border-red-900/50",
              t.type === "info" && "border-blue-200 dark:border-blue-900/50",
              t.type === "warning" && "border-yellow-200 dark:border-yellow-900/50"
            )}
          >
            <div className="flex items-start gap-2">
              <span
                aria-hidden
                className={cls(
                  "mt-0.5 inline-block h-2.5 w-2.5 rounded-full",
                  t.type === "success" && "bg-green-500",
                  t.type === "error" && "bg-red-500",
                  t.type === "info" && "bg-blue-500",
                  t.type === "warning" && "bg-yellow-500"
                )}
              />
              <div className="min-w-0">
                {t.title && <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t.title}</div>}
                <div className="text-sm text-gray-700 dark:text-gray-300 break-words">{t.message}</div>
              </div>
            </div>
            <button
              aria-label="Close notification"
              onClick={() => remove(t.id)}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

