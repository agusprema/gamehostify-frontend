"use client";

import { Suspense, useEffect, useMemo, useState } from 'react';
import PageTransition from "@/components/animations/PageTransition";
import Wrapper from "@/components/ui/Wrapper";
import Link from "@/components/ui/Link";
import { useSearchParams } from 'next/navigation';
import { verifyPhoneChangeMagic } from "@/lib/auth";

function PhoneChangeVerifyContent() {
  const sp = useSearchParams();
  const idParam = sp.get('rid');
  const token = sp.get('token') || '';
  const id = useMemo(() => {
    const n = Number(idParam);
    return Number.isFinite(n) ? n : NaN;
  }, [idParam]);

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>("idle");
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    async function run() {
      if (!token || !idParam || Number.isNaN(id)) {
        setStatus('error');
        setMessage('Tautan tidak valid');
        return;
      }
      setStatus('loading');
      try {
        const json = (await verifyPhoneChangeMagic({ id, token })) as unknown as { message?: string };
        setStatus('success');
        setMessage(json?.message || 'Nomor telepon berhasil diperbarui');
      } catch (err: unknown) {
        const e = err as { message?: string };
        setStatus('error');
        setMessage(e?.message || 'Verifikasi gagal');
      }
    }
    run();
  }, [id, idParam, token]);

  return (
    <PageTransition>
      <Wrapper className="flex items-center justify-center py-10">
        <div className="max-w-md w-full bg-gray-100 dark:bg-gray-900/60 backdrop-blur-md border border-gray-300 dark:border-gray-700 rounded-2xl p-6 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">Verifikasi Perubahan Nomor Telepon</h1>
          {status === 'loading' && (
            <p className="text-gray-300 text-center">Memverifikasi tautan.</p>
          )}
          {status !== 'loading' && (
            <>
              <p className={"text-center " + (status === 'success' ? 'text-green-300' : 'text-red-300')}>{message}</p>
              <div className="mt-4 text-center">
                <Link href="/settings" className="text-accent-400 hover:text-accent-300 font-medium">Kembali ke Pengaturan</Link>
              </div>
            </>
          )}
        </div>
      </Wrapper>
    </PageTransition>
  );
}

export default function PhoneChangeVerifyPage() {
  return (
    <Suspense fallback={null}>
      <PhoneChangeVerifyContent />
    </Suspense>
  );
}
