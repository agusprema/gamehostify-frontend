"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { setFieldErrors } from "@/utils/rhf/setFieldErrors";
import { login } from "@/lib/auth";
import { Mail, LockKeyhole } from "lucide-react";
import Input from "@/components/ui/Input";
import Form from "@/components/ui/Form";

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
    } catch (err: unknown) {
      const e = err as { fields?: Record<string, string | string[] | undefined>; errors?: Record<string, string | string[] | undefined>; message?: string };
      const fields = e?.fields ?? e?.errors ?? null;
      const message = e?.message || "Login gagal";
      const applied = setFieldErrors<LoginValues>(setError, fields, [
        "email",
        "password",
      ]);
      if (!applied) setFormError(message);
    }
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} error={formError}>
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

      <Input
        type="password"
        label="Password"
        placeholder="••••••••"
        leftIcon={<LockKeyhole className="w-5" />}
        error={errors.password?.message}
        autoComplete="current-password"
        {...register("password", { required: "Password wajib diisi" })}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="cursor-pointer w-full inline-flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-60 px-4 py-3 text-white font-semibold shadow-md transition"
      >
        {isSubmitting ? "Memproses." : "Masuk"}
      </button>
    </Form>
  );
}

