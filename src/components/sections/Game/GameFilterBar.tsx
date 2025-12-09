"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Category } from "./types";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

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
    <section className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mx-4" aria-label="Game Filter Bar" role="search">
      {/* Search Input */}
      <div className="relative w-full md:w-1/2" role="searchbox">
        <Input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari game..."
          aria-label="Cari game"
        />
        {isProcessing && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary-500" />
        )}
      </div>

      {/* Category Dropdown */}
      <div className="w-full md:w-1/4">
        <Select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Pilih kategori game"
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.key} value={cat.key}>
              {cat.value}
            </option>
          ))}
        </Select>
      </div>
    </section>
  );
};

export default GameFilterBar;
