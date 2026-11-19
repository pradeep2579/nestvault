/** ilike pattern that finds a phone number however it was typed or stored (spaces, dashes, +91). */
export function phoneSearchPattern(needle: string): string | null {
  if (!/^[\d\s+\-().]+$/.test(needle)) return null;
  const digits = needle.replace(/\D/g, "");
  return digits.length >= 3 ? `%${digits.split("").join("%")}%` : null;
}
