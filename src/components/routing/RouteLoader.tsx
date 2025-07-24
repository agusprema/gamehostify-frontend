'use client';

import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoader } from '@/contexts/LoaderContext';

export default function RouteLoader() {
  const { loading } = useLoader();

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="route-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          {/* Ikon spinner */}
          <Loader2 className="h-10 w-10 text-primary-400 animate-spin" />

          {/* Progress bar (hilangkan repeat: Infinity) */}
          <motion.div
            className="absolute top-0 left-0 h-0.5 w-full origin-left bg-gradient-to-r from-primary-500 to-accent-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.5 }}
          />

          <p className="mt-2 text-primary-200 text-sm">Loading...</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
