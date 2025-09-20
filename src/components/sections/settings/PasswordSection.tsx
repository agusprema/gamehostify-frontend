"use client";

import { memo, useState } from "react";
import { useForm } from "react-hook-form";
import { setFieldErrors } from "@/utils/rhf/setFieldErrors";
import { changePassword } from "@/lib/auth";

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
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="text-lg font-semibold text-white mb-4">Ubah Password</h2>
      {pwdMessage && (
        <div className="mb-3 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
          {pwdMessage}
        </div>
      )}
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
      <form onSubmit={handleSubmitPwd(onSubmitPassword)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-zinc-300 mb-1">Password Saat Ini</label>
          <input
            type="password"
            autoComplete="current-password"
            className={`w-full rounded-lg px-3 py-2 bg-zinc-800 border ${pwdErrors.current_password ? 'border-red-500' : 'border-zinc-700'} text-white`}
            {...registerPwd("current_password", { required: "Wajib diisi" })}
          />
          {pwdErrors.current_password?.message && <p className="mt-1 text-xs text-red-400">{pwdErrors.current_password.message}</p>}
        </div>
        <div>
          <label className="block text-sm text-zinc-300 mb-1">Password Baru</label>
          <input
            type="password"
            autoComplete="new-password"
            className={`w-full rounded-lg px-3 py-2 bg-zinc-800 border ${pwdErrors.password ? 'border-red-500' : 'border-zinc-700'} text-white`}
            {...registerPwd("password", { required: "Wajib diisi", minLength: { value: 8, message: "Minimal 8 karakter" } })}
          />
          {pwdErrors.password?.message && <p className="mt-1 text-xs text-red-400">{pwdErrors.password.message}</p>}
        </div>
        <div>
          <label className="block text-sm text-zinc-300 mb-1">Konfirmasi Password</label>
          <input
            type="password"
            autoComplete="new-password"
            className={`w-full rounded-lg px-3 py-2 bg-zinc-800 border ${pwdErrors.password_confirmation ? 'border-red-500' : 'border-zinc-700'} text-white`}
            {...registerPwd("password_confirmation", { required: "Wajib diisi" })}
          />
          {pwdErrors.password_confirmation?.message && <p className="mt-1 text-xs text-red-400">{pwdErrors.password_confirmation.message}</p>}
        </div>
        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={pwdSubmitting}
            className="cursor-pointer inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 px-4 py-2 text-white font-medium"
          >
            {pwdSubmitting ? 'Menyimpan…' : 'Perbarui Password'}
          </button>
        </div>
      </form>
    </section>
  );
}

export const PasswordSection = memo(PasswordSectionInner);
