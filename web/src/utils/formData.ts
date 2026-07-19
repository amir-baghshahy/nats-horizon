/**
 * Type-safe FormData helper utilities
 */

/**
 * Get a string value from FormData with a default fallback
 */
export function getString(
  formData: FormData,
  key: string,
  defaultValue: string = "",
): string {
  const value = formData.get(key);
  return value !== null ? String(value) : defaultValue;
}

/**
 * Get a number value from FormData with a default fallback
 */
export function getNumber(
  formData: FormData,
  key: string,
  defaultValue: number = 0,
): number {
  const value = formData.get(key);
  if (value === null || value === "") return defaultValue;
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get an optional string value from FormData (null if not present)
 */
export function getOptionalString(
  formData: FormData,
  key: string,
): string | null {
  const value = formData.get(key);
  return value === null || value === "" ? null : String(value);
}

/**
 * Get an optional number value from FormData (null if not present)
 */
export function getOptionalNumber(
  formData: FormData,
  key: string,
): number | null {
  const value = formData.get(key);
  if (value === null || value === "") return null;
  const parsed = Number(value);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Get a boolean value from FormData (checkboxes)
 */
export function getBoolean(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}
