export function normalizePath(path: string): string {
  if (!path) return "/";
  const p = path.trim();
  const qPos = p.indexOf("?");
  const hPos = p.indexOf("#");
  const cut = Math.min(
    qPos === -1 ? p.length : qPos,
    hPos === -1 ? p.length : hPos
  );
  let core = p.slice(0, cut);
  if (core.length > 1 && core.endsWith("/")) core = core.slice(0, -1);
  return core || "/";
}
