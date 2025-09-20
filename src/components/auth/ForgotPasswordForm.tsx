"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { setFieldErrors } from "@/utils/rhf/setFieldErrors";
import { forgotPassword } from "@/lib/auth";
import { Mail } from "lucide-react";

type FormValues = { email: string };

export default function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    setSuccessMsg(null);
    try {
      const res = await forgotPassword(values);
      // Try to read message if provided by API
      const message = (res as any)?.message || "Kami telah mengirim tautan reset ke email Anda.";
      setSuccessMsg(String(message));
      reset({ email: values.email });
    } catch (err: unknown) {
      const e = err as { fields?: Record<string, string | string[] | undefined>; errors?: Record<string, string | string[] | undefined>; message?: string };
      const fields = e?.fields ?? e?.errors ?? null;
      const message = e?.message || "Terjadi kesalahan saat memproses permintaan.";
      const applied = setFieldErrors<FormValues>(setError, fields, ["email"]);
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="cursor-pointer w-full inline-flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-60 px-4 py-3 text-white font-semibold shadow-md transition"
      >
        {isSubmitting ? "Memproses…" : "Kirim Link Reset"}
      </button>
    </form>
  );
}

