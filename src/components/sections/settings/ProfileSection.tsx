"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { setFieldErrors } from "@/utils/rhf/setFieldErrors";
import { updateProfile } from "@/lib/auth";

type ProfileValues = { name: string; email: string };

type ProfileSectionProps = { name: string | null; email: string | null };

function ProfileSectionInner({ name, email }: ProfileSectionProps) {

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    setError: setProfileError,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileValues>({
    defaultValues: useMemo(() => ({ name: name || "", email: email || "" }), [name, email]),
  });

  useEffect(() => {
    resetProfile({ name: name || "", email: email || "" });
  }, [name, email, resetProfile]);

  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  async function onSubmitProfile(values: ProfileValues) {
    setProfileMessage(null);
    try {
      await updateProfile(values);
      setProfileMessage("Profil berhasil diperbarui.");
    } catch (err: unknown) {
      const e = err as { fields?: Record<string, string | string[]>; message?: string };
      const applied = setFieldErrors<ProfileValues>(setProfileError, e?.fields ?? null, ["name", "email"]);
      if (!applied) setProfileMessage(e?.message || "Gagal memperbarui profil");
    }
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="text-lg font-semibold text-white mb-4">Profil</h2>
      {profileMessage && (
        <div className="mb-3 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
          {profileMessage}
        </div>
      )}
      {!!Object.keys(profileErrors).length && (
        <div className="mb-3 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-300 font-medium mb-1">Periksa input berikut:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {profileErrors.name?.message && <li>Nama: {profileErrors.name.message}</li>}
            {profileErrors.email?.message && <li>Email: {profileErrors.email.message}</li>}
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-zinc-300 mb-1">Nama</label>
          <input
            type="text"
            className={`w-full rounded-lg px-3 py-2 bg-zinc-800 border ${profileErrors.name ? 'border-red-500' : 'border-zinc-700'} text-white`}
            {...registerProfile("name", { required: "Nama wajib diisi", maxLength: { value: 255, message: "Maks 255" } })}
          />
          {profileErrors.name?.message && <p className="mt-1 text-xs text-red-400">{profileErrors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm text-zinc-300 mb-1">Email</label>
          <input
            type="email"
            className={`w-full rounded-lg px-3 py-2 bg-zinc-800 border ${profileErrors.email ? 'border-red-500' : 'border-zinc-700'} text-white`}
            {...registerProfile("email", { required: "Email wajib diisi" })}
          />
          {profileErrors.email?.message && <p className="mt-1 text-xs text-red-400">{profileErrors.email.message}</p>}
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={profileSubmitting}
            className="cursor-pointer inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 px-4 py-2 text-white font-medium"
          >
            {profileSubmitting ? 'Menyimpan…' : 'Simpan Profil'}
          </button>
        </div>
      </form>
    </section>
  );
}

export const ProfileSection = memo(ProfileSectionInner);

