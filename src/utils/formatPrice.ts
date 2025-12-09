export function formatPrice(value: number, locale = "id-ID", currency = "IDR") {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 0 }).format(value);
  } catch {
    return `Rp ${Number(value).toLocaleString("id-ID")}`;
  }
}

