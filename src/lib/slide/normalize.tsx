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
export function normalizeSlide(raw: any, baseUrl?: string): Slide | null {
  if (!raw) return null;

  const id = Number(raw.id ?? 0);
  if (!id) return null; // skip invalid

  const title = String(raw.title ?? '').trim();
  const subtitle = raw.subtitle != null ? String(raw.subtitle) : null;

  // Some APIs send HTML in description, some plain text. Accept both.
  const descHtml = (typeof raw.description === 'string' && raw.description.includes('<'))
    ? raw.description
    : (raw.descriptionHtml ?? null);

  const descPlain = typeof raw.description === 'string' && !raw.description.includes('<')
    ? raw.description
    : (raw.descriptionText ?? null);

  // image fallbacks: image_desktop, image, imageUrl
  const image = toAbsolute(
    raw.image_desktop ?? raw.image ?? raw.imageUrl ?? null,
    baseUrl,
  ) ?? '';

  const imageMobile = toAbsolute(
    raw.image_mobile ?? raw.imageMobile ?? null,
    baseUrl,
  );

  const buttonText = String(raw.buttonText ?? raw.button_text ?? 'Lihat Promo');
  const buttonUrl = toAbsolute(raw.buttonUrl ?? raw.button_url ?? null, baseUrl);

  const badge = raw.badge != null ? String(raw.badge) : null;
  const promoCode = raw.promoCode ?? raw.promo_code ?? null;

  const validUntilLabel = raw.validUntilLabel ?? raw.valid_until_label ?? null;
  const validUntil = raw.validUntil ?? raw.valid_until ?? null;

  let meta: any = raw.meta ?? null;
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
    meta,
  };
}

/** Normalize a list (handles various API envelope shapes). */
export function normalizeSlidesPayload(payload: any, baseUrl?: string): Slide[] {
  // Accept shapes: { data: [...] }, { data: { Slider: [...] } }, { Slider: [...] }, [...]
  const candidates: any[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data?.Slider)
      ? payload.data.Slider
      : Array.isArray(payload?.data?.slider)
        ? payload.data.slider
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.Slider)
            ? payload.Slider
            : Array.isArray(payload?.slider)
              ? payload.slider
              : [];

  const slides: Slide[] = [];
  for (const item of candidates) {
    const s = normalizeSlide(item, baseUrl);
    if (s) slides.push(s);
  }
  return slides;
}