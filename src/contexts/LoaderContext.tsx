'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface LoaderContextType {
  showLoader: () => void;
  hideLoader: () => void;
  loading: boolean;
}

const LoaderContext = createContext<LoaderContextType>({
  showLoader: () => {},
  hideLoader: () => {},
  loading: false,
});

export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showLoader = useCallback(() => {
    // Hentikan timer hide sebelumnya kalau ada
    if (timeoutId) clearTimeout(timeoutId);
    setLoading(true);
  }, [timeoutId]);

  const hideLoader = useCallback(() => {
    // Kasih sedikit delay biar animasi progress terlihat smooth
    const id = setTimeout(() => setLoading(false), 150);
    setTimeoutId(id);
  }, []);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader, loading }}>
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);
