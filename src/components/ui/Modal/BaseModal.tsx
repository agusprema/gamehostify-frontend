"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";

type Size = "sm" | "md" | "lg" | "xl";

export interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: Size;
  contentClassName?: string;
  backdropClassName?: string;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  trapFocus?: boolean;
  restoreFocus?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  unmountOnClose?: boolean;
  portalId?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
}

const sizeToMaxWidth: Record<Size, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

export function BaseModal({
  open,
  onClose,
  children,
  size = "md",
  contentClassName = "",
  backdropClassName = "",
  closeOnBackdrop = true,
  closeOnEsc = true,
  trapFocus = true,
  restoreFocus = true,
  initialFocusRef,
  unmountOnClose = true,
  portalId = "__modal-root__",
  ariaLabelledby,
  ariaDescribedby,
}: BaseModalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Lazy portal root creation
  const portalRoot = useMemo(() => {
    if (typeof window === "undefined") return null;
    let node = document.getElementById(portalId);
    if (!node) {
      node = document.createElement("div");
      node.setAttribute("id", portalId);
      document.body.appendChild(node);
    }
    return node;
  }, [portalId]);

  // Body scroll lock when open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Remember previously focused element and restore on close
  useEffect(() => {
    if (!open || !restoreFocus) return;
    previouslyFocusedRef.current = (document.activeElement as HTMLElement) ?? null;
    return () => {
      // Restore focus to the triggering element
      if (restoreFocus && previouslyFocusedRef.current?.focus) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [open, restoreFocus]);

  const focusableSelectors =
    'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

  const focusFirstElement = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const target =
      initialFocusRef?.current ||
      (container.querySelector('[data-autofocus="true"]') as HTMLElement) ||
      (container.querySelector(focusableSelectors) as HTMLElement) ||
      container;
    target?.focus?.();
  }, [initialFocusRef]);

  // Set initial focus when opened
  useEffect(() => {
    if (!open) return;
    // Defer to end of paint to ensure children mounted
    const id = window.requestAnimationFrame(() => focusFirstElement());
    return () => window.cancelAnimationFrame(id);
  }, [open, focusFirstElement]);

  // Trap focus and handle ESC
  useEffect(() => {
    if (!open || (!trapFocus && !closeOnEsc)) return;
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEsc) {
        e.stopPropagation();
        onClose();
        return;
      }
      if (!trapFocus || e.key !== "Tab" || !containerRef.current) return;
      const focusables = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
      ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
      if (focusables.length === 0) {
        // Ensure container itself is focusable
        containerRef.current.tabIndex = -1;
        containerRef.current.focus();
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !containerRef.current.contains(active)) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (active === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    document.addEventListener("keydown", handleKeydown, true);
    return () => document.removeEventListener("keydown", handleKeydown, true);
  }, [open, trapFocus, closeOnEsc, onClose]);

  if (!portalRoot) return null;

  const content = (
    <AnimatePresence presenceAffectsLayout={false}>
      {(open || !unmountOnClose) && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={unmountOnClose ? { opacity: 0 } : undefined}
          animate={{ opacity: open ? 1 : 0 }}
          exit={unmountOnClose ? { opacity: 0 } : undefined}
          style={!open && !unmountOnClose ? { pointerEvents: "none" } : undefined}
          role="dialog"
          aria-modal="true"
          aria-labelledby={ariaLabelledby}
          aria-describedby={ariaDescribedby}
        >
          {/* Backdrop */}
          <motion.div
            className={`absolute inset-0 bg-black/60 dark:bg-black/70 supports-[backdrop-filter]:backdrop-blur-sm ${backdropClassName}`}
            onClick={closeOnBackdrop ? onClose : undefined}
            initial={unmountOnClose ? { opacity: 0 } : undefined}
            animate={{ opacity: open ? 1 : 0 }}
            exit={unmountOnClose ? { opacity: 0 } : undefined}
            aria-hidden="true"
          />

          {/* Content */}
          <motion.div
            ref={containerRef}
            className={`relative z-10 w-full ${sizeToMaxWidth[size]} rounded-2xl border border-gray-300 dark:border-primary-500/20 bg-white dark:bg-gray-900 shadow-lg p-6 transition-colors ${contentClassName}`}
            initial={unmountOnClose ? { scale: 0.98, opacity: 0 } : undefined}
            animate={{ scale: open ? 1 : 0.98, opacity: open ? 1 : 0 }}
            exit={unmountOnClose ? { scale: 0.98, opacity: 0 } : undefined}
            transition={prefersReducedMotion ? { duration: 0.08 } : { type: "spring", stiffness: 240, damping: 26, mass: 0.8 }}
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return portalRoot ? createPortal(content, portalRoot) : null;
}

export default BaseModal;
