import PageTransition from "@/components/animations/PageTransition";
import Wrapper from "@/components/ui/Wrapper";
import Link from "@/components/ui/Link";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { requireGuest } from '@/lib/server/auth-guard';

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function ResetPasswordPage({
  searchParams,
}: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const token = (sp?.token as string) || "";
  const email = (sp?.email as string) || "";

  await requireGuest();

  return (
    <PageTransition>
      <Wrapper className="flex items-center justify-center">
        <div className="max-w-md w-[480px] bg-gray-100 dark:bg-gray-900/60 backdrop-blur-md border border-gray-300 dark:border-gray-700 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">Reset Password</h1>
          <p className="text-accent-400 text-sm mb-6 text-center">Masukkan password baru Anda.</p>

          {!token ? (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              Token reset tidak ditemukan. Silakan cek kembali tautan di email Anda.
            </div>
          ) : (
            <ResetPasswordForm token={token} email={email} />
          )}

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Sudah ingat password?{' '}
            <Link href="/login" className="text-accent-400 hover:text-accent-300 font-medium">
              Kembali ke masuk
            </Link>
          </p>
        </div>
      </Wrapper>
    </PageTransition>
  );
}
