"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { setFieldErrors } from "@/utils/rhf/setFieldErrors";
import { updateProfile } from "@/lib/auth";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Form from "@/components/ui/Form";

type ProfileValues = { name: string; };

type ProfileSectionProps = { name: string | null; };

function ProfileSectionInner({ name}: ProfileSectionProps) {

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    setError: setProfileError,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileValues>({
    defaultValues: useMemo(() => ({ name: name || "" }), [name]),
  });

  useEffect(() => {
    resetProfile({ name: name || "" });
  }, [name, resetProfile]);

  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  async function onSubmitProfile(values: ProfileValues) {
    setProfileMessage(null);
    try {
      await updateProfile(values);
      setProfileMessage("Profil berhasil diperbarui.");
    } catch (err: unknown) {
      const e = err as { fields?: Record<string, string | string[]>; message?: string };
      const applied = setFieldErrors<ProfileValues>(setProfileError, e?.fields ?? null, ["name"]);
      if (!applied) setProfileMessage(e?.message || "Gagal memperbarui profil");
    }
  }

  return (
    <Card title="Profil" className="p-5" variant="glass">
      
      {!!Object.keys(profileErrors).length && (
        <div className="mb-3 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-300 font-medium mb-1">Periksa input berikut:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {profileErrors.name?.message && <li>Nama: {profileErrors.name.message}</li>}
          </ul>
        </div>
      )}
      <Form onSubmit={handleSubmitProfile(onSubmitProfile)} spaced={true} success={profileMessage}>
        <div>
          <Input
            label="Nama"
            type="text"
            error={profileErrors.name?.message}
            variant="glass"
            {...registerProfile("name", { required: "Nama wajib diisi", maxLength: { value: 255, message: "Maks 255" } })}
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={profileSubmitting}
            className="cursor-pointer inline-flex items-center justify-center rounded-lg bg-primary-600/90 hover:bg-primary-500/90 disabled:opacity-60 px-4 py-2 text-white font-medium backdrop-blur-sm shadow-sm ring-1 ring-white/10"
          >
            {profileSubmitting ? 'Menyimpan.' : 'Simpan Profil'}
          </button>
        </div>
      </Form>
    </Card>
  );
}

export const ProfileSection = memo(ProfileSectionInner);
