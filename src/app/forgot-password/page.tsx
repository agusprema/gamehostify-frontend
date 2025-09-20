import PageTransition from "@/components/animations/PageTransition";
import Wrapper from "@/components/ui/Wrapper";
import Link from "@/components/ui/Link";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { requireGuest } from '@/lib/server/auth-guard';

export default async function ForgotPasswordPage() {
  await requireGuest();
  return (
    <PageTransition>
      <Wrapper className="flex items-center justify-center">
        <div className="max-w-md w-[480px] bg-gray-100 dark:bg-gray-900/60 backdrop-blur-md border border-gray-300 dark:border-gray-700 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">Lupa Password</h1>
          <p className="text-accent-400 text-sm mb-6 text-center">Masukkan email yang terdaftar untuk menerima tautan reset.</p>

          <ForgotPasswordForm />

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Ingat password?{' '}
            <Link href="/login" className="text-accent-400 hover:text-accent-300 font-medium">
              Kembali ke masuk
            </Link>
          </p>
        </div>
      </Wrapper>
    </PageTransition>
  );
}
