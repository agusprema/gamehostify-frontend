import { useState, useCallback } from 'react';
import { useCart } from '@/contexts/CartContext';
import type { AddCartParams } from '@/contexts/CartContext';

export function useCartAdd() {
  const { addToCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const submit = useCallback(
    async (params: AddCartParams, onSuccess?: () => void): Promise<boolean> => {
      setIsProcessing(true);
      try {
        const { success, errors } = await addToCart(params);
        if (!success) {
          setFormErrors(errors || {});
          return false;
        }
        setFormErrors({});
        onSuccess?.();
        return true;
      } finally {
        setIsProcessing(false);
      }
    },
    [addToCart]
  );

  const resetErrors = () => setFormErrors({});

  return { submit, isProcessing, formErrors, resetErrors };
}

export default useCartAdd;
