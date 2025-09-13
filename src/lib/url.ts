export function joinUrl(base: string | undefined | null, path: string): string {
  const p = (path ?? '').toString();
  if (!p) return (base ?? '') as string;
  // If path is already absolute, return as-is
  if (/^https?:\/\//i.test(p)) return p;
  const b = (base ?? '').toString();
  if (b) {
    try {
      // Ensure no leading slash on relative path, and base ends with a slash for resolution
      const rel = p.replace(/^\/+/, '');
      const normalizedBase = b.replace(/\/+$/, '') + '/';
      return new URL(rel, normalizedBase).toString();
    } catch {
      // fall through to fallback join
    }
  }
  // Fallback to root-relative path
  return '/' + p.replace(/^\/+/, '');
}

