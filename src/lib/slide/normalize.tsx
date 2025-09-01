import { Slide } from "@/components/sections/Hero/slide";

/** Ensure we have an absolute URL if backend returns relative path */
function toAbsolute(url: string | null | undefined, base?: string): string | null {
  if (!url) return null;
  try {
    // If already absolute, new URL will succeed.
    return new URL(url).toString();
  } catch {
    if (!base) return url; // give up, let next/image handle domain error
    try {
      return new URL(url.replace(/^\/+/, ''), base.endsWith('/') ? base : base + '/').toString();
    } catch {
      return url;
    }
  }
}

/** Normalize any raw item from API into Slide */
export function normalizeSlide(raw: Record<string, unknown>, baseUrl?: string): Slide | null {
  if (!raw) return null;

  const id = Number(raw.id ?? 0);
  if (!id) return null; // skip invalid

  const title = String(raw.title ?? '').trim();
  const subtitle = raw.subtitle != null ? String(raw.subtitle) : null;

  // Some APIs send HTML in description, some plain text. Accept both.
  const descRaw = raw.description;
  const descHtml = (typeof descRaw === 'string' && descRaw.includes('<'))
    ? descRaw
    : ((raw as Record<string, unknown>).descriptionHtml ?? null);

  const descPlain = typeof descRaw === 'string' && !descRaw.includes('<')
    ? descRaw
    : ((raw as Record<string, unknown>).descriptionText ?? null);

  // image fallbacks: image_desktop, image, imageUrl
  const image = toAbsolute(
    (raw as Record<string, unknown>).image_desktop as string | null ?? (raw.image as string | null) ?? (raw as Record<string, unknown>).imageUrl as string | null ?? null,
    baseUrl,
  ) ?? '';

  const imageMobile = toAbsolute(
    (raw as Record<string, unknown>).image_mobile as string | null ?? (raw as Record<string, unknown>).imageMobile as string | null ?? null,
    baseUrl,
  );

  const buttonText = String((raw as Record<string, unknown>).buttonText ?? (raw as Record<string, unknown>).button_text ?? 'Lihat Promo');
  const buttonUrl = toAbsolute((raw as Record<string, unknown>).buttonUrl as string | null ?? (raw as Record<string, unknown>).button_url as string | null ?? null, baseUrl);

  const badge = raw.badge != null ? String(raw.badge) : null;
  const promoCode = (raw as Record<string, unknown>).promoCode ?? (raw as Record<string, unknown>).promo_code ?? null;

  const validUntilLabel = (raw as Record<string, unknown>).validUntilLabel ?? (raw as Record<string, unknown>).valid_until_label ?? null;
  const validUntil = (raw as Record<string, unknown>).validUntil ?? (raw as Record<string, unknown>).valid_until ?? null;

  let meta = (raw as Record<string, unknown>).meta ?? null;
  if (Array.isArray(meta) && meta.length === 0) meta = null; // collapse [] to null for simpler UI

  return {
    id,
    title,
    subtitle,
    descriptionHtml: (descHtml as string | null) ?? null,
    description: (descPlain as string | null) ?? null,
    image,
    imageMobile,
    buttonText,
    buttonUrl,
    badge,
    promoCode: promoCode as string | null,
    validUntilLabel: validUntilLabel as string | null,
    validUntil: validUntil as string | null,
    meta: meta as Record<string, unknown> | null,
  };
}

/** Normalize a list (handles various API envelope shapes). */
export function normalizeSlidesPayload(payload: unknown, baseUrl?: string): Slide[] {
  let candidates: unknown[] = [];
  if (Array.isArray(payload)) {
    candidates = payload as unknown[];
  } else if (payload && typeof payload === 'object') {
    const p = payload as Record<string, unknown>;
    const data = p.data;
    if (Array.isArray(data)) {
      candidates = data as unknown[];
    } else if (data && typeof data === 'object') {
      const d = data as Record<string, unknown>;
      if (Array.isArray(d.Slider)) candidates = d.Slider as unknown[];
      else if (Array.isArray(d.slider)) candidates = d.slider as unknown[];
    }
    if (!candidates.length) {
      if (Array.isArray((p as Record<string, unknown>).Slider)) candidates = (p.Slider as unknown[]);
      else if (Array.isArray((p as Record<string, unknown>).slider)) candidates = (p.slider as unknown[]);
    }
  }

  const slides: Slide[] = [];
  for (const item of candidates) {
    if (item && typeof item === 'object') {
      const s = normalizeSlide(item as Record<string, unknown>, baseUrl);
      if (s) slides.push(s);
    }
  }
  return slides;
}
