export interface ApiError {
  message: string;
  fields?: Record<string, string[]>;
}

/**
 * Helper untuk memproses error response dari API.
 * @param json Response JSON dari API
 * @returns Objek ApiError yang berisi pesan umum dan error field (jika ada).
 */
export function handleApiErrors(json: any): ApiError {
  if (!json) {
    return { message: "Terjadi kesalahan yang tidak diketahui." };
  }

  const message = json.message || "Terjadi kesalahan.";
  const fields = json.errors || undefined;

  return { message, fields };
}
