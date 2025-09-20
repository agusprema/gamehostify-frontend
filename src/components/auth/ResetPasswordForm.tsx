"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { setFieldErrors } from "@/utils/rhf/setFieldErrors";
import { resetPassword } from "@/lib/auth";
import { Mail, LockKeyhole, CheckCheck } from "lucide-react";

type FormValues = {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export default function ResetPasswordForm({
  token,
  email,
}: { token?: string; email?: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      token: token || "",
      email: email || "",
      password: "",
      password_confirmation: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    setSuccessMsg(null);
    try {
      const res = await resetPassword(values);
      const message = (res as any)?.message || "Password berhasil direset.";
      setSuccessMsg(String(message));
      // Redirect langsung ke halaman login setelah berhasil
      router.push("/login");
    } catch (err: unknown) {
      const e = err as { fields?: Record<string, string | string[] | undefined>; errors?: Record<string, string | string[] | undefined>; message?: string };
      const fields = e?.fields ?? e?.errors ?? null;
      const message = e?.message || "Gagal reset password.";
      const applied = setFieldErrors<FormValues>(setError, fields, [
        "token",
        "email",
        "password",
        "password_confirmation",
      ], {
        password_confirmation: "password_confirmation",
      });
      if (!applied) setFormError(message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {formError && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          {formError}
        </div>
      )}
      {successMsg && (
        <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          {successMsg}
        </div>
      )}

      {/* Token (hidden) */}
      <input type="hidden" {...register("token", { required: true })} />

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-black dark:text-white mb-1">Email</label>
        <div className="relative">
          <input
            type="email"
            placeholder="you@example.com"
            className={`w-full rounded-xl px-4 py-3 pl-10 border bg-gray-100 text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white transition ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            {...register("email", {
              required: "Email wajib diisi",
              pattern: { value: /\S+@\S+\.\S+/, message: "Format email tidak valid" },
            })}
          />
          <span className="absolute inset-y-0 left-3 flex items-center text-primary-500">
            <Mail className="w-5" />
          </span>
        </div>
        {errors.email?.message && (
          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-black dark:text-white mb-1">Password Baru</label>
        <div className="relative">
          <input
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={`w-full rounded-xl px-4 py-3 pl-10 border bg-gray-100 text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white transition ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            {...register("password", {
              required: "Password wajib diisi",
              minLength: { value: 8, message: "Minimal 8 karakter" },
            })}
          />
          <span className="absolute inset-y-0 left-3 flex items-center text-primary-500">
            <LockKeyhole className="w-5" />
          </span>
        </div>
        {errors.password?.message && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Password Confirmation */}
      <div>
        <label className="block text-sm font-medium text-black dark:text-white mb-1">Konfirmasi Password</label>
        <div className="relative">
          <input
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={`w-full rounded-xl px-4 py-3 pl-10 border bg-gray-100 text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white transition ${
              errors.password_confirmation ? "border-red-500" : "border-gray-300"
            }`}
            {...register("password_confirmation", {
              required: "Konfirmasi password wajib diisi",
              minLength: { value: 8, message: "Minimal 8 karakter" },
            })}
          />
          <span className="absolute inset-y-0 left-3 flex items-center text-primary-500">
            <CheckCheck className="w-5" />
          </span>
        </div>
        {errors.password_confirmation?.message && (
          <p className="mt-1 text-xs text-red-500">{errors.password_confirmation.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="cursor-pointer w-full inline-flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-60 px-4 py-3 text-white font-semibold shadow-md transition"
      >
        {isSubmitting ? "Memproses…" : "Reset Password"}
      </button>
    </form>
  );
}
