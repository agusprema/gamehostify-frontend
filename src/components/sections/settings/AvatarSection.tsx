"use client";

import { memo, useRef, useState } from "react";
import { updateAvatar } from "@/lib/auth";

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
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="text-lg font-semibold text-white mb-4">Avatar</h2>
      {avatarMessage && (
        <div className={`mb-3 text-sm rounded-lg p-3 border ${avatarMessage.toLowerCase().includes('gagal') ? 'text-red-400 bg-red-500/10 border-red-500/30' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'}`}>
          {avatarMessage}
        </div>
      )}
      <form onSubmit={onSubmitAvatar} className="flex flex-col md:flex-row gap-3 items-start">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          ref={fileInputRef}
          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
          className="file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-indigo-700 file:text-white file:cursor-pointer text-zinc-300"
        />
        <button
          type="submit"
          disabled={avatarSubmitting}
          className="cursor-pointer inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 px-4 py-2 text-white font-medium"
        >
          {avatarSubmitting ? 'Mengunggah…' : 'Perbarui Avatar'}
        </button>
      </form>
    </section>
  );
}

export const AvatarSection = memo(AvatarSectionInner);
