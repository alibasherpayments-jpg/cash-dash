export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return EMAIL_REGEX.test(email.trim());
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return "Please enter your email address";
  }
  if (!isValidEmail(trimmed)) {
    return "Please enter a valid email address (e.g. name@example.com)";
  }
  return null;
}

export function validateRequired(value: string | number | null | undefined, fieldLabel: string = "This field"): string | null {
  if (value === null || value === undefined) {
    return `${fieldLabel} is required`;
  }
  if (typeof value === "string" && !value.trim()) {
    return `${fieldLabel} is required`;
  }
  return null;
}
