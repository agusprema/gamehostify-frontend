'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [displayedChildren, setDisplayedChildren] = useState(children);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  // Saat path berubah → trigger exit
  useEffect(() => {
    if (pathname !== prevPath) {
      setIsAnimating(true);
    }
  }, [pathname, prevPath]);

  const handleExitComplete = () => {
    // setelah exit selesai, tampilkan children baru
    setDisplayedChildren(children);
    setPrevPath(pathname);
    setIsAnimating(false);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <AnimatePresence mode="sync" onExitComplete={handleExitComplete}>
        <motion.div
          key={prevPath} // ini path lama yang akan keluar dulu
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1,
            ease: [1, 0.006, 0.529, 0.988] }}
          style={{
            position: isAnimating ? 'absolute' : 'relative',
            width: '100%',
          }}
        >
          {displayedChildren}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
