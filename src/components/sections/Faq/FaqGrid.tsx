import React from "react";
import { FaqItem } from "./Faq";

export default function FaqGrid({ items, className }: { items: FaqItem[]; className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className || ""}`}>
      {items.map((it, i) => (
        <div
          key={i}
          className="
            p-6 rounded-xl 
            bg-white/80 dark:bg-gray-900/60 
            backdrop-blur-md 
            border border-gray-200 dark:border-gray-700 
            hover:border-primary-400/50 dark:hover:border-primary-500/40 
            transition-all duration-300 hover:scale-[1.02]
          "
        >
          <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{it.q}</h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{it.a}</p>
        </div>
      ))}
    </div>
  );
}
