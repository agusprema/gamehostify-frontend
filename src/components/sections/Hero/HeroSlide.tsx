import React, { useState } from "react";
import { ArrowRight, Copy, Check } from "lucide-react";
import type { Slide } from "./slide";
import Image from "next/image";
import Link from "next/link";

interface HeroSlideProps {
  slide: Slide;
}

const HeroSlide: React.FC<HeroSlideProps> = ({ slide }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const badgeColor = (() => {
    const l = (slide.badge ?? "").toLowerCase();
    if (l.includes("limited")) return "from-primary-600 to-pink-600";
    if (l.includes("hot")) return "from-red-600 to-orange-600";
    return "from-primary-600 to-primary-800";
  })();

  // CTA element
  const hasUrl = !!slide.buttonUrl;
  const CtaEl = hasUrl ? Link : "a";
  const ctaProps = hasUrl ? { href: slide.buttonUrl! } : { href: "#" };

  // Description
  const descHtml =
    slide.descriptionHtml ??
    (slide.description && slide.description.includes("<") ? slide.description : null);
  const descPlain = descHtml == null ? slide.description ?? "" : "";

  return (
    <article
      className="
        bg-white/70 dark:bg-gray-900/70 rounded-xl overflow-hidden shadow-xl border
        border-gray-300 dark:border-gray-800
        grid grid-cols-1 md:grid-cols-2
        min-h-[420px] md:h-[420px] lg:h-[480px] xl:h-[520px]
      "
      aria-labelledby={`hero-slide-title-${slide.id}`}
      aria-label={slide.title}
    >
      {/* Text */}
      <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center">
        {slide.badge && (
          <span
            className={`inline-block self-start text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full text-white
              bg-gradient-to-r ${badgeColor}`}
          >
            {slide.badge}
          </span>
        )}

        <h2 id={`hero-slide-title-${slide.id}`} className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          {slide.title}
        </h2>
        {slide.subtitle && (
          <h3 className="text-lg sm:text-xl md:text-2xl text-primary-600 dark:text-primary-400 font-medium mb-4">
            {slide.subtitle}
          </h3>
        )}

        {/* Description */}
        {descHtml ? (
          <div
            className="text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-6 prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: descHtml }}
          />
        ) : (
          descPlain && (
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-6">
              {descPlain}
            </p>
          )
        )}

        {/* Promo Code */}
        {slide.promoCode && (
          <div
            className={`flex items-center rounded-lg px-4 py-3 mb-6 w-fit
              bg-gray-100 dark:bg-gray-800 border
              ${copied ? "border-green-400" : "border-gray-300 dark:border-gray-700"}`}
          >
            <span className="text-primary-700 dark:text-primary-400 font-semibold mr-3">
              Code: {slide.promoCode}
            </span>
            <button
              type="button"
              onClick={() => handleCopyCode(slide.promoCode!)}
              className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                  <span className="text-green-500 dark:text-green-400 text-sm">Copied!</span>
                </>
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        )}

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row gap-4">
          <CtaEl
            {...ctaProps}
            className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center transition-colors"
          >
            {slide.buttonText || "Lihat Promo"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </CtaEl>
        </div>

        {slide.validUntilLabel && (
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">
            {slide.validUntilLabel}
          </p>
        )}
      </div>

      {/* Image */}
      <div className="relative h-48 sm:h-64 md:h-full">
        <Image
          src={slide.image}
          alt={slide.title}
          className="w-full h-full object-cover"
          width={800}
          height={500}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-l from-white/30 dark:from-black/30 to-white/60 dark:to-black/70" />
      </div>
    </article>
  );
};

export default HeroSlide;
