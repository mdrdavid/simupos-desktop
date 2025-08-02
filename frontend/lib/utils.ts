/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-UG").format(num);
}

export function formatCurrency(amount: number, currency = "UGX"): string {
  return `${currency} ${formatNumber(amount)}`;
}

export function calculateChange(
  amountReceived: number,
  totalDue: number
): number {
  return amountReceived - totalDue;
}

export function getChangeBreakdown(amount: number): { [key: number]: number } {
  const denominations = [
    50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50,
  ];
  const breakdown: { [key: number]: number } = {};
  let remaining = Math.floor(amount);

  for (const denom of denominations) {
    if (remaining >= denom) {
      breakdown[denom] = Math.floor(remaining / denom);
      remaining = remaining % denom;
    }
  }

  return breakdown;
}

export function generateReceiptId(): string {
  return `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function isValidBarcode(barcode: string): boolean {
  return /^[0-9]{8,13}$/.test(barcode);
}

export function formatPhoneNumber(phone: string): string {
  // Format Ugandan phone numbers
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("256")) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith("0")) {
    return `+256${cleaned.slice(1)}`;
  } else {
    return `+256${cleaned}`;
  }
}

export function validatePIN(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateTransactionId(): string {
  return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}
