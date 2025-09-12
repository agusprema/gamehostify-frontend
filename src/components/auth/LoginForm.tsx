"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { setFieldErrors } from "@/utils/rhf/setFieldErrors";
import { login } from "@/lib/auth";
import { Mail, LockKeyhole } from "lucide-react";

type LoginValues = { email: string; password: string };

export default function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    try {
      await login(values);
      router.push("/");
    } catch (err: any) {
      const fields = err?.fields ?? err?.errors ?? null;
      const message = err?.message || "Login gagal";
      const applied = setFieldErrors<LoginValues>(setError, fields, [
        "email",
        "password",
      ]);
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

      <div>
        <label className="block text-sm font-medium text-black dark:text-white mb-1">Email</label>
        <div className="relative">
          <input
            type="email"
            autoComplete="email"
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

      <div>
        <label className="block text-sm font-medium text-black dark:text-white mb-1">Password</label>
        <div className="relative">
          <input
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className={`w-full rounded-xl px-4 py-3 pl-10 border bg-gray-100 text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white transition ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            {...register("password", { required: "Password wajib diisi" })}
          />
          <span className="absolute inset-y-0 left-3 flex items-center text-primary-500">
            <LockKeyhole className="w-5" />
          </span>
        </div>
        {errors.password?.message && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="cursor-pointer w-full inline-flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-60 px-4 py-3 text-white font-semibold shadow-md transition"
      >
        {isSubmitting ? "Memproses…" : "Masuk"}
      </button>
    </form>
  );
}
