"use client";

import { memo, useState } from "react";
import { useForm } from "react-hook-form";
import { setFieldErrors } from "@/utils/rhf/setFieldErrors";
import { changePassword } from "@/lib/auth";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Form from "@/components/ui/Form";

type PasswordValues = { current_password: string; password: string; password_confirmation: string };

function PasswordSectionInner() {
  const {
    register: registerPwd,
    handleSubmit: handleSubmitPwd,
    setError: setPwdError,
    reset: resetPwd,
    formState: { errors: pwdErrors, isSubmitting: pwdSubmitting },
  } = useForm<PasswordValues>({ defaultValues: { current_password: "", password: "", password_confirmation: "" } });

  const [pwdMessage, setPwdMessage] = useState<string | null>(null);

  async function onSubmitPassword(values: PasswordValues) {
    setPwdMessage(null);
    try {
      await changePassword(values);
      setPwdMessage("Password berhasil diperbarui.");
      resetPwd({ current_password: "", password: "", password_confirmation: "" });
    } catch (err: unknown) {
      const e = err as { fields?: Record<string, string | string[]>; message?: string };
      const applied = setFieldErrors<PasswordValues>(setPwdError, e?.fields ?? null, [
        "current_password",
        "password",
        "password_confirmation",
      ]);
      if (!applied) setPwdMessage(e?.message || "Gagal mengganti password");
    }
  }

  return (
    <Card title="Ubah Password" className="p-5" variant="glass">
      {!!Object.keys(pwdErrors).length && (
        <div className="mb-3 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-300 font-medium mb-1">Periksa input berikut:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {pwdErrors.current_password?.message && <li>Password Saat Ini: {pwdErrors.current_password.message}</li>}
            {pwdErrors.password?.message && <li>Password: {pwdErrors.password.message}</li>}
            {pwdErrors.password_confirmation?.message && <li>Konfirmasi Password: {pwdErrors.password_confirmation.message}</li>}
          </ul>
        </div>
      )}
      <Form onSubmit={handleSubmitPwd(onSubmitPassword)} spaced={false} success={pwdMessage} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Input
            label="Password Saat Ini"
            type="password"
            autoComplete="current-password"
            error={pwdErrors.current_password?.message}
            variant="glass"
            {...registerPwd("current_password", { required: "Wajib diisi" })}
          />
        </div>
        <div>
          <Input
            label="Password Baru"
            type="password"
            autoComplete="new-password"
            error={pwdErrors.password?.message}
            variant="glass"
            {...registerPwd("password", { required: "Wajib diisi", minLength: { value: 8, message: "Minimal 8 karakter" } })}
          />
        </div>
        <div>
          <Input
            label="Konfirmasi Password"
            type="password"
            autoComplete="new-password"
            error={pwdErrors.password_confirmation?.message}
            variant="glass"
            {...registerPwd("password_confirmation", { required: "Wajib diisi" })}
          />
        </div>
        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={pwdSubmitting}
            className="cursor-pointer inline-flex items-center justify-center rounded-lg bg-primary-600/90 hover:bg-primary-500/90 disabled:opacity-60 px-4 py-2 text-white font-medium backdrop-blur-sm shadow-sm ring-1 ring-white/10"
          >
            {pwdSubmitting ? 'Menyimpan.' : 'Perbarui Password'}
          </button>
        </div>
      </Form>
    </Card>
  );
}

export const PasswordSection = memo(PasswordSectionInner);
