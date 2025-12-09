import { redirect } from "next/navigation";
import { apiRequest } from "@/lib/http";

type VerifyEmailPageProps = {
  searchParams?: {
    id?: string;
    hash?: string;
    expires?: string;
    signature?: string;
  };
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const id = searchParams?.id;
  const hash = searchParams?.hash;
  const expires = searchParams?.expires;
  const signature = searchParams?.signature;

  if (!id || !hash) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-xl font-semibold mb-2 text-white">
            Verifikasi ada msalah
          </h1>
          <p className="text-sm text-gray-300">
            Tautan verifikasi tidak valid atau sudah kedaluwarsa.
          </p>
        </div>
      </main>
    );
  }

  const qs = new URLSearchParams();
  if (expires) qs.set("expires", expires);
  if (signature) qs.set("signature", signature);
  const query = qs.toString();

  try {
    await apiRequest<unknown>(
      `/api/auth/email/verify/${encodeURIComponent(id)}/${encodeURIComponent(hash)}${
        query ? `?${query}` : ""
      }`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );
    // Hanya redirect jika verifikasi sukses (response OK)
    //redirect("/login");

    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-xl font-semibold mb-2 text-white">
            Verifikasi email berhasil
          </h1>
          <p className="text-sm text-gray-300">
            Tautan verifikasi tidak valid atau sudah kedaluwarsa.
          </p>
        </div>
      </main>
    );
  } catch {
    // Jika gagal, tampilkan pesan error sederhana
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-xl font-semibold mb-2 text-white">
            Verifikasi email gagal
          </h1>
          <p className="text-sm text-gray-300">
            Tautan verifikasi tidak valid atau sudah kedaluwarsa.
          </p>
        </div>
      </main>
    );
  }
}
