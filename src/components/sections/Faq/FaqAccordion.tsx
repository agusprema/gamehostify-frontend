"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FaqItem } from "./Faq";

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <dl className="divide-y divide-gray-200 dark:divide-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md shadow-sm" aria-label="FAQ Accordion">
      {items.map((it, i) => (
        <div key={i}>
          <dt>
            <button
              type="button"
              onClick={() => toggle(i)}
              className="w-full cursor-pointer flex items-center justify-between text-left px-5 py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-expanded={openIndex === i}
              aria-controls={`faq-panel-${i}`}
              id={`faq-header-${i}`}
            >
              <span className="font-semibold text-gray-900 dark:text-white">{it.q}</span>
              <ChevronDown
                className={`h-5 w-5 text-primary-500 dark:text-primary-400 transition-transform duration-300 ${
                  openIndex === i ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>
          </dt>
          <AnimatePresence initial={false}>
            {openIndex === i && (
              <motion.dd
                id={`faq-panel-${i}`}
                aria-labelledby={`faq-header-${i}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400">
                  {it.a}
                </div>
              </motion.dd>
            )}
          </AnimatePresence>
        </div>
      ))}
    </dl>
  );
}
