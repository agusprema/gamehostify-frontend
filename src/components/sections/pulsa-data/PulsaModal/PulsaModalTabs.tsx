import React from "react";
import { Smartphone, Wifi } from "lucide-react";
import { motion } from "framer-motion";

interface PulsaModalTabsProps {
  tab: "pulsa" | "data";
  setTab: (t: "pulsa" | "data") => void;
}

export default function PulsaModalTabs({ tab, setTab }: PulsaModalTabsProps) {
  const tabs: Array<"pulsa" | "data"> = ["pulsa", "data"];

  return (
    <div className="relative flex mb-4 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setTab(t)}
          className={`flex-1 relative z-10 px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2
            ${
              tab === t
                ? "text-gray-900 dark:text-white bg-primary-100 dark:bg-transparent"
                : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
            }`}
        >
          {t === "pulsa" ? <Smartphone className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
          {t.charAt(0).toUpperCase() + t.slice(1)}
        </button>
      ))}

      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-primary-600 dark:bg-primary-500 z-20"
        initial={false}
        animate={{
          x: tab === "pulsa" ? "0%" : "100%",
          width: "50%",
        }}
        transition={{ type: "spring", stiffness: 250, damping: 30 }}
      />

    </div>
  );
}
