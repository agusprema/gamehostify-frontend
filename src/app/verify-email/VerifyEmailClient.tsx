/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";
import { handleApiErrors } from "@/utils/apiErrorHandler";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    async function run() {
      const signedUrl = searchParams.get("url");

      if (!signedUrl) {
        setStatus("error");
        setMessage("Tautan verifikasi tidak valid.");
        return;
      }

      try {
        const res = await apiFetch(signedUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        let json: unknown = null;
        try {
          json = await res.clone().json();
        } catch {
          json = null;
        }

        if (!res.ok) {
          const { message } = handleApiErrors(json);
          setStatus("error");
          setMessage(
            message || "Verifikasi email gagal atau tautan kedaluwarsa."
          );
          return;
        }

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
