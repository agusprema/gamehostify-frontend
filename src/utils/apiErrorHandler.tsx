export interface ApiError {
  message: string;
  fields?: Record<string, string[]>;
}

/**
 * Helper untuk memproses error response dari API.
 * @param json Response JSON dari API
 * @returns Objek ApiError yang berisi pesan umum dan error field (jika ada).
 */
export function handleApiErrors(json: unknown): ApiError {
  if (!json || typeof json !== 'object') {
    return { message: "Terjadi kesalahan yang tidak diketahui." };
  }

  const obj = json as Record<string, unknown>;
  const message = typeof obj.message === 'string' ? obj.message : "Terjadi kesalahan.";
  const fields = (obj.errors && typeof obj.errors === 'object')
    ? (obj.errors as Record<string, string[]>)
    : undefined;

  return { message, fields };
}
