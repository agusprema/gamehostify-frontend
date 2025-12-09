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
    redirect("/login");
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
  } catch {
    // Abaikan error, tetap redirect ke login
  }

  redirect("/login");
}

