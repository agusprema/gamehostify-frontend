import PageTransition from "@/components/animations/PageTransition";
import Wrapper from "@/components/ui/Wrapper";
import Link from '@/components/ui/Link';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <PageTransition>
      <Wrapper className="flex items-center justify-center">
        <div className="max-w-md w-[480px] bg-gray-100 dark:bg-gray-900/60 backdrop-blur-md border border-gray-300 dark:border-gray-700 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">Masuk</h1>
          <p className="text-accent-400 text-sm mb-6 text-center">Selamat datang di {process.env.NEXT_PUBLIC_APP_NAME}</p>

          <LoginForm />

          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-primary-800"></div>
            <span className="px-3 text-xs text-primary-500">atau</span>
            <div className="flex-grow h-px bg-primary-800"></div>
          </div>

          <button
            type="button"
            className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-xl bg-primary-800 hover:bg-primary-700 px-4 py-3 text-white text-sm font-medium transition"
          >
            🔑 Masuk dengan Google
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Belum punya akun?{' '}
            <Link href="/register" className="text-accent-400 hover:text-accent-300 font-medium">
              Daftar
            </Link>
          </p>
        </div>
      </Wrapper>
    </PageTransition>
  );
}

