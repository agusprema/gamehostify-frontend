import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export const dynamic = "force-dynamic";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-xl font-semibold mb-2 text-white">
              Memverifikasi email…
            </h1>
            <p className="text-sm text-gray-300">
              Mohon tunggu sebentar, kami sedang memproses tautan verifikasi
              Anda.
            </p>
          </div>
        </main>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}
