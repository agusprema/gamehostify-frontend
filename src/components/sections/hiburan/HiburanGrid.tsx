"use client";
import React from "react";
import Image from "next/image";
import type { Hiburan } from "./types";

interface HiburanGridProps {
  hiburans: Hiburan[];
  onSelect: (ent: Hiburan) => void;
  isHome?: boolean;
}

export function HiburanGrid({ hiburans, onSelect, isHome }: HiburanGridProps) {
  const shown = isHome ? hiburans.slice(0, 6) : hiburans;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {shown.map((ent) => (
        <button
          key={ent.id}
          onClick={() => onSelect(ent)}
          className="relative cursor-pointer group overflow-hidden rounded-2xl
            bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800/60 dark:to-gray-900/80
            p-4 hover:shadow-lg hover:shadow-primary-500/20
            border border-gray-300 dark:border-gray-800
            hover:border-primary-400 dark:hover:border-primary-500/50
            transition-all duration-300"
        >
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20">
              <Image
                src={ent.logo}
                alt={ent.name}
                fill
                className="rounded-lg object-contain group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>

          <h3 className="text-gray-800 dark:text-white text-lg font-semibold text-center group-hover:text-primary-500 dark:group-hover:text-primary-400 transition">
            {ent.name}
          </h3>

          {ent.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm text-center mt-2 line-clamp-2">
              {ent.description}
            </p>
          )}

          <div className="absolute inset-0 rounded-2xl bg-primary-500/0 group-hover:bg-primary-500/5 transition"></div>
        </button>
      ))}
    </div>
  );
}
