"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Category } from "./types";

interface GameFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  categories: Category[];
  isProcessing?: boolean;
}

const GameFilterBar: React.FC<GameFilterBarProps> = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
  isProcessing = false,
}) => {
  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mx-4">
      {/* Search Input */}
      <div className="relative w-full md:w-1/2">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari game..."
          className="
            w-full rounded-lg border border-gray-300 dark:border-gray-700 
            bg-white dark:bg-gray-900
            px-4 py-2 text-gray-800 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            focus:border-primary-500 focus:ring-2 focus:ring-primary-500 
            focus:outline-none
          "
        />
        {isProcessing && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary-500" />
        )}
      </div>

      {/* Category Dropdown */}
      <div className="w-full md:w-1/4">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="
            w-full rounded-lg border border-gray-300 dark:border-gray-700
            bg-white dark:bg-gray-900
            px-4 py-2 text-gray-800 dark:text-white
            focus:border-primary-500 focus:ring-2 focus:ring-primary-500 
            focus:outline-none
          "
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.key} value={cat.key}>
              {cat.value}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default GameFilterBar;
