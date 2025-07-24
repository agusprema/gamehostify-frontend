"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative flex items-center w-14 h-7 rounded-full transition-colors duration-300 ${
        isDark ? "bg-gradient-to-r from-primary-600 to-indigo-600" : "bg-gray-300"
      }`}
      aria-label="Toggle theme"
    >
      {/* Icon dalam toggle */}
      <div
        className={`absolute flex items-center justify-center w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
          isDark ? "translate-x-7" : "translate-x-1"
        }`}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-primary-600" />
        ) : (
          <Sun className="h-4 w-4 text-yellow-500" />
        )}
      </div>
    </button>
  );
}
