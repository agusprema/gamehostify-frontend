"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HeroHeading } from "./HeroHeading";
import HeroSlide from "./HeroSlide";
import HeroStats from "./HeroStats";
import type { Slide } from "./slide";

const AUTO_INTERVAL = 10000; // ms

// local fallback demo slides (used if no API data)
const fallbackSlides: Slide[] = [
  {
    id: 1,
    title: "Top Up Mobile Legends",
    subtitle: "Bonus 20% Diamonds",
    description:
      "Nikmati promo spesial top-up Mobile Legends dengan bonus diamond 20%. Berlaku untuk semua paket di atas 1000.",
    image:
      "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800",
    buttonText: "Top Up Sekarang",
    buttonUrl: null,
    badge: "Limited Offer",
    promoCode: "ML20BONUS",
    validUntilLabel: "Sampai 31 Des 2024",
  },
  {
    id: 2,
    title: "Diskon Free Fire",
    subtitle: "Hemat 30% Semua Paket",
    description:
      "Dapatkan diskon besar untuk top-up Free Fire diamonds. Waktu terbatas, jangan sampai kelewatan.",
    image:
      "https://images.pexels.com/photos/1174746/pexels-photo-1174746.jpeg?auto=compress&cs=tinysrgb&w=800",
    buttonText: "Lihat Promo",
    buttonUrl: null,
    badge: "Hot Deal",
    validUntilLabel: "Berakhir 3 hari lagi",
  },
];

interface HeroProps {
  slider?: Slide[] | null;
}

const Hero: React.FC<HeroProps> = ({ slider }) => {
  const slides = useMemo(
    () => (slider && slider.length > 0 ? slider : fallbackSlides),
    [slider]
  );

  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const progressRef = useRef<number | null>(null);

  const stopAuto = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (progressRef.current) window.clearInterval(progressRef.current);
  }, []);

  const startAuto = useCallback(() => {
    stopAuto();
    let counter = 0;
    setProgress(0);

    progressRef.current = window.setInterval(() => {
      counter += 100 / (AUTO_INTERVAL / 100);
      setProgress(counter);
    }, 100);

    timerRef.current = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setProgress(0);
      counter = 0;
    }, AUTO_INTERVAL);
  }, [stopAuto, slides.length]);

  const restartAuto = useCallback(() => {
    stopAuto();
    startAuto();
  }, [stopAuto, startAuto]);

  useEffect(() => {
    startAuto();
    return () => stopAuto();
  }, [startAuto, stopAuto, slides.length]);


  // Navigation handlers with useCallback for performance
  const handleNext = useCallback(() => {
    setCurrentSlide((p) => (p + 1) % slides.length);
    restartAuto();
  }, [slides.length, restartAuto]);

  const handlePrev = useCallback(() => {
    setCurrentSlide((p) => (p - 1 + slides.length) % slides.length);
    restartAuto();
  }, [slides.length, restartAuto]);

  const goToSlide = useCallback((i: number) => {
    setCurrentSlide(i);
    restartAuto();
  }, [restartAuto]);

  // Memoize current slide for performance
  const s = useMemo(() => slides[currentSlide], [slides, currentSlide]);

  return (
    <section className="relative min-h-[80vh] flex items-center" aria-label="Hero Section">
      <div className="relative w-full max-w-7xl mx-auto px-6 py-12 text-gray-900 dark:text-white">
        <HeroHeading
          brandName={process.env.NEXT_PUBLIC_APP_NAME}
          headlineAccent="Semua Kebutuhan Digital"
          subline={process.env.NEXT_PUBLIC_SLOGAN}
          chips={[
            "Instan",
            "Aman",
            "Harga Lokal",
            "Banyak Pilihan",
            "Support 24/7",
          ]}
        />

        {/* Slider */}
        <div className="relative" aria-label="Hero Slider" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={s?.id ?? currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.6 }}
            >
              {s && <HeroSlide slide={s} />}
            </motion.div>
          </AnimatePresence>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-300 dark:bg-gray-700">
            <div
              className="h-1 bg-primary-500 transition-all"
              style={{ width: `${progress}%` }}
              aria-hidden="true"
            />
          </div>

          {/* Navigation */}
          <div className="pointer-events-none absolute inset-0 hidden sm:flex items-center justify-between" aria-label="Slider navigation">
            <button
              type="button"
              onClick={handlePrev}
              className="pointer-events-auto cursor-pointer bg-gray-200/80 dark:bg-gray-800/80 hover:bg-gray-300 dark:hover:bg-gray-700 p-3 rounded-full -translate-x-6 sm:-translate-x-12"
              aria-label="Sebelumnya"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="pointer-events-auto cursor-pointer bg-gray-200/80 dark:bg-gray-800/80 hover:bg-gray-300 dark:hover:bg-gray-700 p-3 rounded-full translate-x-6 sm:translate-x-12"
              aria-label="Berikutnya"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center mt-4 space-x-2" aria-label="Pilih slide">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToSlide(i)}
              aria-label={`Pilih slide ${i + 1}`}
              aria-current={i === currentSlide ? "true" : undefined}
              className={`w-3 h-3 rounded-full transition-transform ${
                i === currentSlide
                  ? "bg-primary-500 scale-125"
                  : "bg-gray-400 dark:bg-gray-600 hover:bg-gray-500 dark:hover:bg-gray-500 cursor-pointer"
              }`}
            />
          ))}
        </div>

        <HeroStats />
      </div>
    </section>
  );
};

export default Hero;
