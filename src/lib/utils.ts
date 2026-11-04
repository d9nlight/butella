import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines CSS class names safely using clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a numeric price into Kazakhstan Tenge (₸) currency format.
 * Example: 25000 -> "25 000 ₸"
 */
export function formatPrice(amount: number): string {
  return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₸`;
}

/**
 * Formats a phone number into readable Kazakhstan format: +7 (7XX) XXX-XX-XX
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11 && (cleaned.startsWith("7") || cleaned.startsWith("8"))) {
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
  }
  return phone;
}
