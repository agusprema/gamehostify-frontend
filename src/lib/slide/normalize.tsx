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
export function normalizeSlide(raw: unknown, baseUrl?: string): Slide | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  const id = Number((r.id as number | string | undefined) ?? 0);
  if (!id) return null; // skip invalid

  const title = String((r.title as string | number | undefined) ?? '').trim();
  const subtitle = r.subtitle != null ? String(r.subtitle as string | number) : null;

  // Some APIs send HTML in description, some plain text. Accept both.
  const descHtml = (typeof r.description === 'string' && r.description.includes('<'))
    ? (r.description as string)
    : ((r.descriptionHtml as string | null | undefined) ?? null);

  const descPlain = typeof r.description === 'string' && !r.description.includes('<')
    ? (r.description as string)
    : ((r.descriptionText as string | null | undefined) ?? null);

  // image fallbacks: image_desktop, image, imageUrl
  const image = toAbsolute(
    (r.image_desktop as string | null | undefined) ?? (r.image as string | null | undefined) ?? (r.imageUrl as string | null | undefined) ?? null,
    baseUrl,
  ) ?? '';

  const imageMobile = toAbsolute(
    (r.image_mobile as string | null | undefined) ?? (r.imageMobile as string | null | undefined) ?? null,
    baseUrl,
  );

  const buttonText = String((r.buttonText as string | number | undefined) ?? (r.button_text as string | number | undefined) ?? 'Lihat Promo');
  const buttonUrl = toAbsolute(((r.buttonUrl as string | null | undefined) ?? (r.button_url as string | null | undefined) ?? null), baseUrl);

  const badge = r.badge != null ? String(r.badge as string | number) : null;
  const promoCode = (r.promoCode as string | null | undefined) ?? (r.promo_code as string | null | undefined) ?? null;

  const validUntilLabel = (r.validUntilLabel as string | null | undefined) ?? (r.valid_until_label as string | null | undefined) ?? null;
  const validUntil = (r.validUntil as string | null | undefined) ?? (r.valid_until as string | null | undefined) ?? null;

  let meta: unknown = (r.meta as unknown) ?? null;
  if (Array.isArray(meta) && meta.length === 0) meta = null; // collapse [] to null for simpler UI

  return {
    id,
    title,
    subtitle,
    descriptionHtml: descHtml ?? null,
    description: descPlain ?? null,
    image,
    imageMobile,
    buttonText,
    buttonUrl,
    badge,
    promoCode,
    validUntilLabel,
    validUntil,
    meta: (meta as Slide['meta']) ?? null,
  };
}

/** Normalize a list (handles various API envelope shapes). */
export function normalizeSlidesPayload(payload: unknown, baseUrl?: string): Slide[] {
  const candidatesUnknown: unknown[] = (() => {
    if (Array.isArray(payload)) return payload;
    if (payload && typeof payload === 'object') {
      const root = payload as Record<string, unknown>;
      const data = root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : null;
      if (data) {
        if (Array.isArray(data.Slider)) return data.Slider as unknown[];
        if (Array.isArray(data.slider)) return data.slider as unknown[];
        if (Array.isArray(data)) return data as unknown[];
      }
      if (Array.isArray(root.Slider)) return root.Slider as unknown[];
      if (Array.isArray(root.slider)) return root.slider as unknown[];
    }
    return [] as unknown[];
  })();

  const slides: Slide[] = [];
  for (const item of candidatesUnknown) {
    const s = normalizeSlide(item, baseUrl);
    if (s) slides.push(s);
  }
  return slides;
}
