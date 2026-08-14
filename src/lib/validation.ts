export function sanitizePhoneInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

export function isValidPhone(value: string): boolean {
  return /^\d{10}$/.test(value);
}
