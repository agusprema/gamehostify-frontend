"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { setFieldErrors } from "@/utils/rhf/setFieldErrors";
import { forgotPassword } from "@/lib/auth";
import { Mail } from "lucide-react";
import Input from "@/components/ui/Input";
import Form from "@/components/ui/Form";

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
      const res = await forgotPassword(values);
      const message = getMessage(res) || "Kami telah mengirim tautan reset ke email Anda.";
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
    <Form onSubmit={handleSubmit(onSubmit)} error={formError} success={successMsg}>
      <Input
        type="email"
        label="Email"
        placeholder="you@example.com"
        leftIcon={<Mail className="w-5" />}
        error={errors.email?.message}
        autoComplete="email"
        {...register("email", {
          required: "Email wajib diisi",
          pattern: { value: /\S+@\S+\.\S+/, message: "Format email tidak valid" },
        })}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="cursor-pointer w-full inline-flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-60 px-4 py-3 text-white font-semibold shadow-md transition"
      >
        {isSubmitting ? "Memproses." : "Kirim Link Reset"}
      </button>
    </Form>
  );
}
