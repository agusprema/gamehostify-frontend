export function getPublicBackendBase(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL,
    process.env.NEXT_PUBLIC_API_BASE_URL,
    process.env.BACKEND_API_BASE_URL,
  ];
  for (const c of candidates) {
    if (c && String(c).trim()) return String(c);
  }
  return "";
}

