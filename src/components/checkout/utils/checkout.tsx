import type { CustomerFormValues } from "../types/checkout";
import { CUSTOMER_FIELD_ALIASES } from "../constants/checkout";

/** Klasifikasi error dari API ke kelompok customer vs channel. */
export function classifyErrorField(field: string): "customer" | "channel" {
  return field in CUSTOMER_FIELD_ALIASES ? "customer" : "channel";
}

export interface BuildErrorObjectsResult {
  customer: Partial<Record<keyof CustomerFormValues, string>>;
  channel: Record<string, string>;
  hasCustomerErr: boolean;
  hasChannelErr: boolean;
}

/** Transform payload error API ke bentuk yang cocok untuk UI forms. */
export function buildErrorObjects(
  errs: Record<string, string[] | string>
): BuildErrorObjectsResult {
  const customer: Partial<Record<keyof CustomerFormValues, string>> = {};
  const channel: Record<string, string> = {};
  let hasCustomerErr = false;
  let hasChannelErr = false;

  Object.entries(errs).forEach(([field, messages]) => {
    const msg = Array.isArray(messages) ? messages[0] : String(messages);
    if (classifyErrorField(field) === "customer") {
      hasCustomerErr = true;
      const key = CUSTOMER_FIELD_ALIASES[field];
      if (key) customer[key] = msg;
    } else {
      hasChannelErr = true;
      channel[field] = msg;
    }
  });

  return { customer, channel, hasCustomerErr, hasChannelErr };
}

/**
 * Update object nested berdasarkan path dot. Immutable & type‑friendly.
 *
 * Catatan:
 * - Karena `fullKey` adalah string dinamis, kita tidak bisa mendapat type safety
 *   penuh (TS tidak tahu path valid). Output tetap dikembalikan sebagai `T`.
 * - `value` bertipe `unknown` untuk menghindari `any`.
 */
export function updateNestedProps<T extends Record<string, unknown>>(
  prev: T,
  fullKey: string,
  value: unknown
): T {
  const parts = fullKey.split(".");
  if (parts.length === 1) {
    return { ...prev, [fullKey]: value } as T;
  }

  const [root, ...rest] = parts;

  // Ambil root object yang ada (kalau bukan object → pakai object kosong)
  const rootCurrent =
    typeof prev[root] === "object" && prev[root] !== null
      ? (prev[root] as Record<string, unknown>)
      : {};

  // Clone shallow untuk root
  const newRoot: Record<string, unknown> = { ...rootCurrent };

  // Cursor untuk jalan ke dalam nested
  let cursor: Record<string, unknown> = newRoot;

  for (let i = 0; i < rest.length - 1; i++) {
    const k = rest[i];
    const existing = cursor[k];
    if (typeof existing === "object" && existing !== null) {
      // clone shallow agar tetap immutable
      cursor[k] = { ...(existing as Record<string, unknown>) };
    } else {
      cursor[k] = {};
    }
    cursor = cursor[k] as Record<string, unknown>;
  }

  // Set nilai terakhir
  cursor[rest[rest.length - 1]] = value;

  // Return object baru dengan root diganti clone
  return { ...prev, [root]: newRoot } as T;
}
