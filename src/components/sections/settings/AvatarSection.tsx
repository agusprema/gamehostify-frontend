"use client";

import { memo, useRef, useState } from "react";
import { updateAvatar } from "@/lib/auth";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

function AvatarSectionInner() {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
  const [avatarSubmitting, setAvatarSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function onSubmitAvatar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAvatarMessage(null);
    if (!avatarFile) {
      setAvatarMessage("Pilih file gambar terlebih dahulu.");
      return;
    }
    const inputEl = fileInputRef.current;
    setAvatarSubmitting(true);
    try {
      await updateAvatar(avatarFile);
      setAvatarMessage("Avatar berhasil diperbarui.");
      setAvatarFile(null);
      if (inputEl) inputEl.value = "";
    } catch (err: unknown) {
      const e2 = err as { fields?: Record<string, string | string[]>; message?: string };
      const fieldErr = e2?.fields?.avatar;
      if (fieldErr) {
        const msg = Array.isArray(fieldErr) ? fieldErr[0] : String(fieldErr);
        setAvatarMessage(msg || e2?.message || "Gagal memperbarui avatar");
      } else {
        setAvatarMessage(e2?.message || "Gagal memperbarui avatar");
      }
    } finally {
      setAvatarSubmitting(false);
    }
  }

  return (
    <Card title="Avatar" className="p-5" variant="glass">
      {avatarMessage && (
        <div className={`mb-3 text-sm rounded-lg p-3 border ${avatarMessage.toLowerCase().includes('gagal') ? 'text-red-400 bg-red-500/10 border-red-500/30' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'}`}>
          {avatarMessage}
        </div>
      )}
      <form onSubmit={onSubmitAvatar} className="flex flex-col md:flex-row gap-3 items-start">
        <Input
          type="file"
          label="Pilih Gambar"
          accept="image/png,image/jpeg,image/webp"
          ref={fileInputRef}
          onChange={(e) => setAvatarFile((e.target as HTMLInputElement).files?.[0] || null)}
          variant="glass"
          className="file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-primary-600/90 file:hover:bg-primary-500/90 file:text-white file:cursor-pointer"
        />
        <button
          type="submit"
          disabled={avatarSubmitting}
          className="cursor-pointer inline-flex items-center justify-center rounded-lg bg-primary-600/90 hover:bg-primary-500/90 disabled:opacity-60 px-4 py-2 text-white font-medium backdrop-blur-sm shadow-sm ring-1 ring-white/10"
        >
          {avatarSubmitting ? 'Mengunggah.' : 'Perbarui Avatar'}
        </button>
      </form>
    </Card>
  );
}

export const AvatarSection = memo(AvatarSectionInner);
