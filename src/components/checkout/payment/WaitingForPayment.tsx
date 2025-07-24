'use client'

import React, { useEffect, useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import PaymentInstructions from '@/components/checkout/payment/PaymentInstructions';
import { CheckoutTransaction, TransactionAction } from "@/components/checkout/types/checkout";

interface Props {
  transaction: CheckoutTransaction;
  onPaid: () => void;
}

const DEFAULT_TIMEOUT_SECONDS = 3600;

const WaitingForPayment: React.FC<Props> = ({ transaction, onPaid }) => {
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  // Countdown Timer
  useEffect(() => {
    if (!transaction.created_at) return;

    const created = new Date(transaction.created_at).getTime();
    const expire = created + DEFAULT_TIMEOUT_SECONDS * 1000;

    const updateCountdown = () => {
      const now = Date.now();
      const diff = expire - now;
      setRemainingTime(diff > 0 ? Math.floor(diff / 1000) : 0);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [transaction.created_at]);

  // Redirect if DEEPLINK_URL or WEB_URL is present
  useEffect(() => {
    transaction.actions?.forEach((action) => {
      if (
        action.type === 'REDIRECT_CUSTOMER' &&
        (action.descriptor === 'WEB_URL' || action.descriptor === 'DEEPLINK_URL') &&
        action.value
      ) {
        window.location.href = action.value;
      }
    });
  }, [transaction.actions]);

  // Polling every 5s to check if paid
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1/payment/${transaction.reference_id}/check`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
      const json = await res.json();
      if (json.data.status === 'SUCCEEDED') {
        clearInterval(interval);
        onPaid();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [transaction.reference_id, onPaid]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="rounded-xl p-10 border shadow-sm 
      bg-white text-gray-800 border-gray-200 
      dark:bg-gray-900/50 dark:text-white dark:border-gray-700 text-center transition-colors">
      
      <AlertCircle className="h-12 w-12 text-yellow-500 dark:text-yellow-400 mx-auto mb-4" />
      
      <h2 className="text-xl font-bold mb-2">Waiting for Payment</h2>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Please complete the payment using the method below.
      </p>

      <PaymentInstructions
        actions={transaction.actions?.filter((a): a is Required<TransactionAction> => !!a.descriptor && !!a.value)}
      />

      <p className="text-gray-900 dark:text-white text-lg font-semibold mt-6 mb-1">
        Rp{transaction.amount.toLocaleString('id-ID')}
      </p>

      <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
        Invoice ID: <span className="text-gray-800 dark:text-white font-mono">{transaction.reference_id}</span>
      </p>

      {remainingTime !== null && (
        <div className="flex items-center justify-center text-sm text-yellow-600 dark:text-yellow-400 mt-4">
          <Clock className="w-4 h-4 mr-2" />
          Expired in: <span className="ml-1 font-medium">{formatTime(remainingTime)}</span>
        </div>
      )}

      <p className="text-gray-400 text-xs mt-6 dark:text-gray-500">
        System will detect payment automatically every 5 seconds.
      </p>
    </div>
  );
};

export default WaitingForPayment;
