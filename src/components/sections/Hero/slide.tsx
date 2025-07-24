export type SlideMeta = Record<string, any> | null | undefined;

export interface Slide {
  id: number;
  title: string;
  subtitle?: string | null;
  /** Description plain text (fallback). */
  description?: string | null;
  /** Description HTML (preferred if backend sends <p>...)</p> */
  descriptionHtml?: string | null;
  /** Primary desktop image URL. */
  image: string;
  /** Optional mobile variant. */
  imageMobile?: string | null;
  buttonText: string;
  buttonUrl?: string | null;
  badge?: string | null;
  promoCode?: string | null;
  /** Human readable label: "Berakhir 7 hari lagi" */
  validUntilLabel?: string | null;
  /** Optional ISO date string if provided by API. */
  validUntil?: string | null;
  /** Flexible meta payload. */
  meta?: Record<string, any> | null;
}
