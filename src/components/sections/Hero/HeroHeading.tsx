import { Gamepad2 } from "lucide-react";

interface HeroHeadingProps {
  brandName?: string;
  headlineAccent?: string;
  subline?: string;
  chips?: string[];
}

export function HeroHeading({
  brandName = "Credix",
  headlineAccent = "Top Up Game Instan",
  subline = "Isi ulang diamond & credits langsung masuk.",
  chips = ["Cepat", "Aman", "Harga Lokal", "Support 24/7"],
}: HeroHeadingProps) {
  return (
    <header className="text-center mb-10" aria-labelledby="hero-title">
      {/* Icon */}
      <Gamepad2 className="h-10 w-10 text-primary-500 mx-auto mb-4" aria-hidden="true" />

      {/* Headline */}
      <h1 id="hero-title" className="text-3xl sm:text-5xl font-extrabold mb-3 leading-tight text-gray-900 dark:text-white">
        {brandName}{" "}
        <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
          {headlineAccent}
        </span>
      </h1>

      {/* Subline */}
      <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
        {subline}
      </p>

      {/* Chips */}
      {chips && chips.length > 0 && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {chips.map((c) => (
            <span
              key={c}
              className="text-xs sm:text-sm px-3 py-1 rounded-full border border-primary-400/40 text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-800/10"
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
