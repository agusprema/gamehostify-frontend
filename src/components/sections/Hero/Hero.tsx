"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HeroHeading } from "./HeroHeading";
import HeroSlide from "./HeroSlide";
import HeroStats from "./HeroStats";
import type { Slide } from "./slide";

const AUTO_INTERVAL = 10000;

interface HeroProps {
  slider?: Slide[] | null;
}

const Hero: React.FC<HeroProps> = ({ slider }) => {
  const slides = useMemo(() => slider ?? [], [slider]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const stopAuto = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  }, []);

  const startAuto = useCallback(() => {
    if (slides.length <= 1) return;

    stopAuto();
    let counter = 0;
    setProgress(0);

    progressRef.current = setInterval(() => {
      counter += 100 / (AUTO_INTERVAL / 100);
      setProgress(counter);
    }, 100);

    timerRef.current = setInterval(() => {
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
    if (slides.length === 0) return;

    startAuto();
    return () => stopAuto();
  }, [startAuto, stopAuto, slides.length]);

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

  const current = useMemo(() => slides[currentSlide], [slides, currentSlide]);

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
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current?.id ?? currentSlide}
              initial={{ opacity: 1, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.25 }}
            >
              {current && <HeroSlide slide={current} />}
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
          {slides.length > 1 && (
            <div className="pointer-events-none absolute inset-0 hidden sm:flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                className="pointer-events-auto bg-gray-200/80 dark:bg-gray-800/80 hover:bg-gray-300 dark:hover:bg-gray-700 p-3 rounded-full -translate-x-6 sm:-translate-x-12"
                aria-label="Sebelumnya"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="pointer-events-auto bg-gray-200/80 dark:bg-gray-800/80 hover:bg-gray-300 dark:hover:bg-gray-700 p-3 rounded-full translate-x-6 sm:translate-x-12"
                aria-label="Berikutnya"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Dots */}
        {slides.length > 1 && (
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
        )}

        <HeroStats />
      </div>
    </section>
  );
};

export default Hero;
