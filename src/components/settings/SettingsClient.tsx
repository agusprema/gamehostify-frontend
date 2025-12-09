"use client";

import PageTransition from "@/components/animations/PageTransition";
import Wrapper from "@/components/ui/Wrapper";
import Link from "@/components/ui/Link";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { ProfileSection } from "../sections/settings/ProfileSection";
import { PasswordSection } from "../sections/settings/PasswordSection";
import { AvatarSection } from "../sections/settings/AvatarSection";
import { TokensSection } from "../sections/settings/TokensSection";
import { EmailChangeSection } from "../sections/settings/EmailChangeSection";
import { PhoneChangeSection } from "../sections/settings/PhoneChangeSection";

export default function SettingsClient() {
  const { loading, authenticated, user } = useAuthStatus();

  if (loading) {
    return (
      <Wrapper className="flex items-center justify-center py-10">
        <div className="max-w-md w-full bg-gray-100 dark:bg-gray-900/60 backdrop-blur-md border border-gray-300 dark:border-gray-700 rounded-2xl p-6 shadow-2xl">
          <p className="text-gray-600 dark:text-gray-300 text-center">Memuat…</p>
        </div>
      </Wrapper>
    );
  }

  if (!authenticated) {
    return (
      <Wrapper className="flex items-center justify-center py-10">
        <div className="max-w-md w-full bg-gray-100 dark:bg-gray-900/60 backdrop-blur-md border border-gray-300 dark:border-gray-700 rounded-2xl p-6 shadow-2xl">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Pengaturan Akun</h1>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            Kamu belum login. Silakan <Link href="/login" className="text-accent-400 hover:text-accent-300 font-medium">login</Link> terlebih dahulu.
          </p>
        </div>
      </Wrapper>
    );
  }

  return (
    <PageTransition>
      <Wrapper className="flex items-start justify-center py-10">
        <div className="w-full max-w-4xl space-y-8 px-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pengaturan Akun</h1>
          <ProfileSection name={user?.name ?? null} email={user?.email ?? null} />
          <EmailChangeSection />
          <PhoneChangeSection />
          <PasswordSection />
          <AvatarSection />
          <TokensSection />
        </div>
      </Wrapper>
    </PageTransition>
  );
}
