export function sanitizePhoneInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

export function isValidPhone(value: string): boolean {
  return /^\d{10}$/.test(value);
}

export const BITS_ID_PATTERN = /202\d\w{2}[A-Z]{2}\d{4}P$/;

export function isValidBitsId(value: string): boolean {
  return BITS_ID_PATTERN.test(value.toUpperCase());
}
