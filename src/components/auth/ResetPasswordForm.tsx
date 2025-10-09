"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { setFieldErrors } from "@/utils/rhf/setFieldErrors";
import { resetPassword } from "@/lib/auth";
import { Mail, LockKeyhole, CheckCheck } from "lucide-react";
import Input from "@/components/ui/Input";
import Form from "@/components/ui/Form";

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

  function getMessage(val: unknown): string | null {
    if (val && typeof val === 'object') {
      if ('message' in (val as { message?: unknown })) {
        const v = (val as { message?: unknown }).message;
        if (typeof v === 'string') return v;
      }
      if ('data' in (val as { data?: { message?: unknown } })) {
        const d = (val as { data?: { message?: unknown } }).data;
        const mv = d?.message;
        if (typeof mv === 'string') return mv;
      }
    }
    return null;
  }

  async function onSubmit(values: FormValues) {
    setFormError(null);
    setSuccessMsg(null);
    try {
      const res = await resetPassword(values);
      const message = getMessage(res) || "Password berhasil direset.";
      setSuccessMsg(String(message));
      router.push("/login");
    } catch (err: unknown) {
      const e = err as { fields?: Record<string, string | string[] | undefined>; errors?: Record<string, string | string[] | undefined>; message?: string };
      const fields = e?.fields ?? e?.errors ?? null;
      const message = e?.message || "Gagal reset password.";
      const applied = setFieldErrors<FormValues>(
        setError,
        fields,
        ["token", "email", "password", "password_confirmation"],
        { password_confirmation: "password_confirmation" }
      );
      if (!applied) setFormError(message);
    }
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} error={formError} success={successMsg}>
      {/* Token (hidden) */}
      <input type="hidden" {...register("token", { required: true })} />

      <Input
        type="email"
        label="Email"
        placeholder="you@example.com"
        leftIcon={<Mail className="w-5" />}
        error={errors.email?.message}
        {...register("email", {
          required: "Email wajib diisi",
          pattern: { value: /\S+@\S+\.\S+/, message: "Format email tidak valid" },
        })}
      />

      <Input
        type="password"
        label="Password Baru"
        placeholder="••••••••"
        leftIcon={<LockKeyhole className="w-5" />}
        error={errors.password?.message}
        autoComplete="new-password"
        {...register("password", {
          required: "Password wajib diisi",
          minLength: { value: 8, message: "Minimal 8 karakter" },
        })}
      />

      <Input
        type="password"
        label="Konfirmasi Password"
        placeholder="••••••••"
        leftIcon={<CheckCheck className="w-5" />}
        error={errors.password_confirmation?.message}
        autoComplete="new-password"
        {...register("password_confirmation", {
          required: "Konfirmasi password wajib diisi",
          minLength: { value: 8, message: "Minimal 8 karakter" },
        })}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="cursor-pointer w-full inline-flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-60 px-4 py-3 text-white font-semibold shadow-md transition"
      >
        {isSubmitting ? "Memproses." : "Reset Password"}
      </button>
    </Form>
  );
}
