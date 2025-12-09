/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/http";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    async function run() {
      const id = searchParams.get("id");
      const hash = searchParams.get("hash");
      const expires = searchParams.get("expires") || undefined;
      const signature = searchParams.get("signature") || undefined;

      if (!id || !hash) {
        setStatus("error");
        setMessage("Tautan verifikasi tidak valid.");
        return;
      }

      const qs = new URLSearchParams();
      if (expires) qs.set("expires", expires);
      if (signature) qs.set("signature", signature);
      const query = qs.toString();

      try {
        await apiRequest<unknown>(
          `/api/auth/email/verify/${encodeURIComponent(
            id
          )}/${encodeURIComponent(hash)}${query ? `?${query}` : ""}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );
        setStatus("success");
        router.push("/login");
      } catch {
        setStatus("error");
        setMessage("Verifikasi email gagal atau tautan kedaluwarsa.");
      }
    }

    run();
  }, [router, searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        {status === "loading" && (
          <>
            <h1 className="text-xl font-semibold mb-2 text-white">
              Memverifikasi email…
            </h1>
            <p className="text-sm text-gray-300">
              Mohon tunggu sebentar, kami sedang memproses tautan verifikasi
              Anda.
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-xl font-semibold mb-2 text-white">
              Verifikasi email gagal
            </h1>
            <p className="text-sm text-gray-300">{message}</p>
          </>
        )}
      </div>
    </main>
  );
}

