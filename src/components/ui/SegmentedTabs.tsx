import React from "react";

export interface SegmentedItem {
  key: string;
  label: string;
}

interface SegmentedTabsProps {
  items: SegmentedItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export function SegmentedTabs({ items, activeKey, onChange, className = "" }: SegmentedTabsProps) {
  return (
    <div className={`relative flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 ${className}`} role="tablist">
      {items.map((g) => {
        const isActive = g.key === activeKey;
        return (
          <button
            key={g.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(g.key)}
            className={`flex-1 relative z-10 px-4 py-2 text-sm font-medium transition-colors ${
              isActive ? "text-gray-900 dark:text-white bg-primary-100/30 dark:bg-transparent" : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
            }`}
          >
            {g.label}
          </button>
        );
      })}
      <div
        aria-hidden
        className="absolute inset-0 z-0 flex"
        style={{
          // purely decorative background gradient
          background: "linear-gradient(to right, transparent, transparent)",
        }}
      />
    </div>
  );
}

export default SegmentedTabs;

