import PageTransition from "@/components/animations/PageTransition";
import Wrapper from "@/components/ui/Wrapper";
import Link from '@/components/ui/Link';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <PageTransition>
      <Wrapper className="flex items-center justify-center">
        <div className="max-w-xl md:max-w-md w-full bg-gray-100 dark:bg-gray-900/60 backdrop-blur-md border border-gray-300 dark:border-gray-700 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">Daftar</h1>
          <p className="text-accent-400 text-sm mb-6 text-center">Buat akun baru untuk mulai.</p>

          <RegisterForm />

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-accent-400 hover:text-accent-300 font-medium">
              Masuk
            </Link>
          </p>
        </div>
      </Wrapper>
    </PageTransition>
  );
}

