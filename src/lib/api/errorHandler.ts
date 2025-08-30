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
  if (!json || typeof json !== "object") {
    return { message: "Terjadi kesalahan yang tidak diketahui." };
  }

  const { message = "Terjadi kesalahan.", errors } = json as {
    message?: string;
    errors?: Record<string, string[]>;
  };

  return { message, fields: errors };
}
