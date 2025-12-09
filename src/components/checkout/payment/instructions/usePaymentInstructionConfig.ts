import { useEffect, useState } from "react";
import type { PaymentConfig } from "./types";

export function usePaymentInstructionConfig() {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/data/payment_instructions_va.json", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load payment instructions");
        const json = (await res.json()) as PaymentConfig;
        if (active) setConfig(json);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        if (active) setError(message);
        console.warn("Payment instructions config not loaded:", e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { config, loading, error } as const;
}
