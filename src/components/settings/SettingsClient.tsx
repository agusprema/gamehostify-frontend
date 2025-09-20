"use client";

import PageTransition from "@/components/animations/PageTransition";
import Wrapper from "@/components/ui/Wrapper";
import Link from "@/components/ui/Link";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { ProfileSection } from "../sections/settings/ProfileSection";
import { PasswordSection } from "../sections/settings/PasswordSection";
import { AvatarSection } from "../sections/settings/AvatarSection";
import { TokensSection } from "../sections/settings/TokensSection";

export default function SettingsClient() {
  const { loading, authenticated, user } = useAuthStatus();

  if (loading) {
    return (
      <Wrapper className="flex items-center justify-center">
        <div className="max-w-3xl w-full p-6"><p className="text-zinc-400">Memuat…</p></div>
      </Wrapper>
    );
  }

  if (!authenticated) {
    return (
      <Wrapper className="flex items-center justify-center">
        <div className="max-w-3xl w-full p-6">
          <h1 className="text-xl font-semibold text-white mb-2">Pengaturan Akun</h1>
          <p className="text-zinc-400">
            Kamu belum login. Silakan <Link href="/login" className="text-indigo-400 hover:text-indigo-300">login</Link> terlebih dahulu.
          </p>
        </div>
      </Wrapper>
    );
  }

  return (
    <PageTransition>
      <Wrapper className="flex items-start justify-center py-10">
        <div className="w-full max-w-4xl space-y-8 px-4">
          <h1 className="text-2xl font-bold text-white">Pengaturan Akun</h1>
          <ProfileSection name={user?.name ?? null} email={user?.email ?? null} />
          <PasswordSection />
          <AvatarSection />
          <TokensSection />
        </div>
      </Wrapper>
    </PageTransition>
  );
}
