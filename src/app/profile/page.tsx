"use client";

import PageTransition from "@/components/animations/PageTransition";
import Wrapper from "@/components/ui/Wrapper";
import Link from '@/components/ui/Link';
import { useAuthStatus } from '@/hooks/useAuthStatus';

function formatBirthDate(input: unknown): string {
  if (!input) return "-";
  try {
    const d = new Date(typeof input === "string" || typeof input === "number" ? (input as string) : (input as Date));
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
    }
  } catch {}
  return typeof input === "string" ? input : "-";
}

function formatGender(g: unknown): string {
  if (!g) return "-";
  const val = String(g).toUpperCase();
  if (val === "MALE") return "Laki-laki";
  if (val === "FEMALE") return "Perempuan";
  if (val === "OTHER") return "Lainnya";
  return String(g);
}

export default function ProfilePage() {
  const { loading, authenticated, user } = useAuthStatus();

  if (loading) {
    return (
      <Wrapper className="flex items-center justify-center py-10">
        <div className="max-w-3xl w-full p-6"><p className="text-slate-600 dark:text-slate-400">Memuat.</p></div>
      </Wrapper>
    );
  }

  if (!authenticated) {
    return (
      <Wrapper className="flex items-center justify-center py-10">
        <div className="max-w-3xl w-full p-6">
          <h1 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">Profil</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Kamu belum login. Silakan <Link href="/login" className="text-accent-600 hover:text-accent-500 dark:text-accent-300 dark:hover:text-accent-200">login</Link> terlebih dahulu.
          </p>
        </div>
      </Wrapper>
    );
  }

  const initials = (user?.name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join("");

  const profileDetails = [
    { label: "Email", value: user?.email ?? "-" },
    { label: "Nomor Telepon", value: user?.phone ?? "-" },
    { label: "Tanggal Lahir", value: formatBirthDate(user?.birth_date ?? null) },
    { label: "Gender", value: formatGender(user?.gender ?? null) },
  ];

  return (
    <PageTransition>
      <Wrapper className="py-16">

        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-10 px-4">
          <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary-200/80 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary-700 shadow-lg shadow-primary-200/40 backdrop-blur-xl dark:border-white/15 dark:bg-white/10 dark:text-primary-200 dark:shadow-indigo-950/20">
              Akun kamu
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 drop-shadow-sm sm:text-4xl dark:text-white">Profil pribadi</h1>
            <p className="max-w-2xl text-sm text-slate-600 sm:text-base dark:text-slate-300">
              Cek ringkasan informasi akunmu dan pastikan data selalu terkini untuk pengalaman topup game, pulsa data, dan layanan streaming tanpa hambatan.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
            <section className="rounded-[32px] border border-primary-200/60 bg-white/70 p-7 text-slate-900 shadow-2xl shadow-primary-200/50 backdrop-blur-2xl transition hover:border-primary-300/80 dark:border-white/15 dark:bg-white/10 dark:text-white dark:shadow-primary-950/30">
              <div className="flex flex-col items-center text-center">
                <div className="relative inline-flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary-400/80 to-accent-500/80 p-[2px] shadow-xl shadow-primary-300/40 dark:shadow-primary-950/30">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-primary-500 text-3xl font-semibold text-white dark:bg-zinc-950/80">
                      {initials}
                    </span>
                  )}
                </div>
                <div className="mt-6 space-y-2">
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{user?.name ?? '-'}</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{user?.email ?? '-'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user?.phone?.trim()?.length ? user.phone : 'Nomor telepon belum diisi'}
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <span className="inline-flex items-center rounded-full border border-primary-300/70 bg-primary-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:border-primary-500/40 dark:bg-primary-500/20 dark:text-primary-200">
                    Topup Siap
                  </span>
                  <span className="inline-flex items-center rounded-full border border-accent-300/70 bg-accent-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-700 dark:border-accent-500/40 dark:bg-accent-500/20 dark:text-accent-200">
                    Streaming Aktif
                  </span>
                </div>
                <Link
                  href="/settings"
                  className="mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-accent-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-300/40 transition hover:-translate-y-[1px] hover:from-primary-400 hover:to-accent-500/90 dark:shadow-primary-900/30"
                >
                  Kelola Pengaturan
                </Link>
              </div>
            </section>

            <div className="space-y-6">
              <section className="rounded-[32px] border border-primary-100/60 bg-white/70 p-7 text-slate-900 shadow-xl shadow-primary-200/40 backdrop-blur-2xl dark:border-white/15 dark:bg-white/10 dark:text-white dark:shadow-black/40">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Informasi Utama</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Data personal yang membantu mempercepat transaksi digitalmu.</p>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {profileDetails.map((item) => (
                    <div
                      key={item.label}
                      className="group relative overflow-hidden rounded-2xl border border-primary-100/50 bg-white/80 p-4 text-left shadow-lg shadow-primary-200/30 backdrop-blur-xl transition hover:border-primary-400/60 hover:bg-gradient-to-br hover:from-primary-300/15 hover:to-accent-300/15 dark:border-white/10 dark:bg-white/10 dark:shadow-primary-950/20"
                    >
                      <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-primary-400/60 to-accent-400/60 opacity-0 transition group-hover:opacity-100" />
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-slate-400">{item.label}</p>
                      <p className="mt-2 text-base font-medium text-slate-900 dark:text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[32px] border border-primary-100/60 bg-white/70 p-7 text-slate-900 shadow-xl shadow-primary-200/40 backdrop-blur-2xl dark:border-white/15 dark:bg-white/10 dark:text-white dark:shadow-black/40">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Keamanan &amp; Pengaturan</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Pastikan informasi akun selalu terbaru agar pembayaran dan langgananmu tetap aman.</p>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-primary-100/50 bg-white/80 p-4 shadow-lg shadow-primary-200/30 backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:shadow-primary-950/20">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-slate-400">Status Akun</p>
                    <p className="mt-2 text-base font-medium text-slate-900 dark:text-white">Aktif</p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Akunmu aktif dan dapat digunakan untuk membeli topup game, pulsa data, maupun layanan streaming kapan saja.</p>
                  </div>
                  <div className="rounded-2xl border border-primary-100/50 bg-white/80 p-4 shadow-lg shadow-primary-200/30 backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:shadow-primary-950/20">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-slate-400">Keamanan</p>
                    <p className="mt-2 text-base font-medium text-slate-900 dark:text-white">Email terverifikasi</p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      Atur ulang password atau ubah detail login kamu melalui halaman pengaturan akun.
                    </p>
                    <Link
                      href="/reset-password"
                      className="mt-3 inline-flex text-xs font-semibold text-primary-700 transition hover:text-primary-600 dark:text-primary-200 dark:hover:text-primary-100"
                    >
                      Ganti password
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </Wrapper>
    </PageTransition>
  );
}
