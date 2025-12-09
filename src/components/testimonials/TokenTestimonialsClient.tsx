"use client";

import { useEffect, useMemo, useState } from "react";
import Form from "@/components/ui/Form";
import Textarea from "@/components/ui/Textarea";
import { Star } from "lucide-react";
import { apiRequest } from "@/lib/http";

type TokenValidateSuccess = {
  status: "success";
  message: string;
  data: {
    valid: boolean;
    expired: boolean;
    used: boolean;
    expires_at?: string;
    type: string; // e.g. "GAME_PACKAGE"
    purchasable_id: number;
    target?: { id: number; name?: string } | null;
  };
};

type PublicTestimonialsResponse = {
  status: "success";
  message: string;
  data: {
    type: string;
    count: number;
    items: Array<{
      id: number;
      rating: number;
      content: string;
      author?: string | null;
      created_at?: string | null;
    }>;
  };
};

type SubmitPayload = { rating: number; content: string };

type SubmitSuccess = { status: "success"; message: string; data: null };

export default function TokenTestimonialsClient({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [tokenErr, setTokenErr] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<TokenValidateSuccess["data"] | null>(null);

  const [listLoading, setListLoading] = useState(false);
  const [publicList, setPublicList] = useState<PublicTestimonialsResponse["data"] | null>(null);

  const [rating, setRating] = useState<number>(5);
  const [content, setContent] = useState<string>("");
  const [hover, setHover] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ rating?: string | string[]; content?: string | string[] }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const targetName = tokenData?.target?.name || "Produk";

  const validationMessage = useMemo(() => {
    if (!tokenData) return tokenErr;
    if (!tokenData.valid) {
      if (tokenData.expired) return "Token kedaluwarsa.";
      if (tokenData.used) return "Token sudah dipakai.";
      return tokenErr || "Token tidak valid.";
    }
    return null;
  }, [tokenData, tokenErr]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setTokenErr(null);
      try {
        const res = await apiRequest<TokenValidateSuccess>(`/api/v1/testimonials/token/${encodeURIComponent(token)}`, {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (!ignore) {
          setTokenData(res.data);
        }
      } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        let msg = e?.message || "Token tidak ditemukan";
        if (e?.status === 404) msg = "Token tidak ditemukan";
        if (!ignore) {
          setTokenErr(msg);
          setTokenData(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [token]);

  useEffect(() => {
    const td = tokenData;
    const valid = td?.valid && !td?.expired && !td?.used;
    if (!valid || !td) return;
    const { type, purchasable_id } = td;
    let ignore = false;
    async function loadList() {
      setListLoading(true);
      try {
        const url = `/api/v1/testimonials/${encodeURIComponent(type)}?limit=5&purchasable_id=${encodeURIComponent(String(purchasable_id))}`;
        const res = await apiRequest<PublicTestimonialsResponse>(url, {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (!ignore) setPublicList(res.data);
      } catch {
        if (!ignore) setPublicList(null);
      } finally {
        if (!ignore) setListLoading(false);
      }
    }
    loadList();
    return () => { ignore = true; };
  }, [tokenData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tokenData?.valid || tokenData.expired || tokenData.used) return;
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});
    try {
      // client-side basic validation
      if (rating < 1 || rating > 5) {
        setFieldErrors((fe) => ({ ...fe, rating: "Rating harus 1 sampai 5" }));
        setSubmitting(false);
        return;
      }
      if (!content || content.trim().length < 10) {
        setFieldErrors((fe) => ({ ...fe, content: "Konten minimal 10 karakter" }));
        setSubmitting(false);
        return;
      }
      const payload: SubmitPayload = { rating, content: content.trim() };
      await apiRequest<SubmitSuccess>(`/api/v1/testimonials/token/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string; fields?: Record<string, string[]> | null };
      const status = e?.status;
      if (status === 404) setFormError("Token tidak ditemukan");
      else if (status === 410) setFormError("Token kedaluwarsa");
      else if (status === 409) setFormError("Token sudah dipakai");
      else if (status === 422) {
        const fields = e?.fields || {};
        const ce = fields?.content;
        setFieldErrors((fe) => ({ ...fe, content: ce && ce.length ? ce : "Validasi gagal" }));
        setFormError(e?.message || "Validasi gagal");
      } else {
        setFormError(e?.message || "Gagal mengirim testimonial");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2">Testimonial</h1>
        <p className="text-gray-600 dark:text-gray-300">Tautan tidak valid: token tidak ditemukan di URL.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Tulis Testimonial</h1>
      {loading ? (
        <p className="text-gray-600 dark:text-gray-300">Memuat token…</p>
      ) : validationMessage ? (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">{validationMessage}</div>
      ) : tokenData ? (
        <>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Untuk: <span className="font-semibold">{targetName}</span>
          </p>

          <Form onSubmit={handleSubmit} error={formError} success={submitted ? "Terima kasih! Testimonial Anda telah diterima." : null}>
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1">Rating</label>
              <div className="flex items-center gap-1" onMouseLeave={() => setHover(null)}>
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = (hover ?? rating) >= n;
                  return (
                    <button
                      key={n}
                      type="button"
                      disabled={submitted}
                      onMouseEnter={() => setHover(n)}
                      onFocus={() => setHover(n)}
                      onBlur={() => setHover(null)}
                      onClick={() => setRating(n)}
                      className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-400/60 disabled:opacity-60"
                      aria-label={`Pilih rating ${n}`}
                      aria-pressed={rating === n}
                    >
                      <Star
                        className={active ? "w-6 h-6 text-yellow-400" : "w-6 h-6 text-gray-400"}
                        strokeWidth={1.5}
                        fill={active ? "currentColor" : "none"}
                      />
                    </button>
                  );
                })}
              </div>
              {fieldErrors.rating && (
                <div className="mt-1 text-sm text-red-500">{Array.isArray(fieldErrors.rating) ? fieldErrors.rating.join(", ") : fieldErrors.rating}</div>
              )}
            </div>

            <Textarea
              label="Testimonial"
              placeholder="Tuliskan pengalaman Anda (10–1000 karakter)…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              minLength={10}
              maxLength={1000}
              error={fieldErrors.content}
              disabled={submitted}
              rows={5}
            />

            <button
              type="submit"
              disabled={submitting || submitted}
              className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-60 px-5 py-3 text-white font-semibold shadow-md transition"
            >
              {submitted ? "Sudah Dikirim" : submitting ? "Mengirim…" : "Kirim Testimonial"}
            </button>
          </Form>

          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-3">Testimonial Pengguna Lain</h2>
            {listLoading && <p className="text-gray-600 dark:text-gray-300">Memuat testimonial…</p>}
            {!listLoading && (!publicList || publicList.count === 0) && (
              <p className="text-gray-600 dark:text-gray-300">Belum ada testimonial untuk {targetName}.</p>
            )}
            {!listLoading && publicList && publicList.items && publicList.items.length > 0 && (
              <ul className="space-y-4">
                {publicList.items.map((it) => (
                  <li key={it.id} className="rounded-xl border border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-sm p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-yellow-400" aria-label={`Rating ${it.rating}`}>
                        {"★★★★★".slice(0, it.rating)}
                        <span className="text-gray-400">{"★★★★★".slice(0, 5 - it.rating)}</span>
                      </div>
                      {it.author && <div className="text-sm text-gray-500 dark:text-gray-400">{it.author}</div>}
                    </div>
                    <p className="text-gray-900 dark:text-gray-100">{it.content}</p>
                    {it.created_at && (
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{new Date(it.created_at).toLocaleString()}</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
