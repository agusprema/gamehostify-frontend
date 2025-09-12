import { FieldValues, Path, UseFormSetError } from 'react-hook-form';

type FieldsMap = Record<string, string[] | string | undefined> | undefined | null;

/**
 * Terapkan error dari backend (map of field -> messages) ke react-hook-form.
 * - `known` adalah daftar field yang ingin dicoba di-set;
 * - `map` opsional untuk memetakan nama field backend ke nama field form.
 * Mengembalikan true jika ada minimal satu field yang di-set.
 */
export function setFieldErrors<TFieldValues extends FieldValues>(
  setError: UseFormSetError<TFieldValues>,
  fields: FieldsMap,
  known: Array<Path<TFieldValues>>,
  map?: Partial<Record<string, Path<TFieldValues>>>
): boolean {
  if (!fields || typeof fields !== 'object') return false;
  let appliedAny = false;
  for (const key of Object.keys(fields)) {
    const target = (map && map[key]) || (known.includes(key as Path<TFieldValues>) ? (key as Path<TFieldValues>) : undefined);
    if (!target) continue;
    const v = (fields as any)[key];
    const msg = Array.isArray(v) ? String(v[0] ?? '') : String(v ?? '');
    if (msg) {
      setError(target, { type: 'server', message: msg });
      appliedAny = true;
    }
  }
  return appliedAny;
}

