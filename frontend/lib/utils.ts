/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-UG").format(num);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function formatCurrency(amount: number, currency = "UGX"): string {
  // return `${currency} ${formatNumber(amount)}`;
  return `${formatNumber(amount)}`;
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

// Format number with commas for display in input fields
export function formatNumberWithCommas(value: string): string {
  // Remove any existing commas and non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, '');
  
  // Split by decimal point
  const parts = cleaned.split('.');
  
  // Add commas to the integer part
  if (parts[0]) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  // Rejoin with decimal part if it exists
  return parts.join('.');
}

// Parse formatted number back to numeric value
export function parseFormattedNumber(value: string): number {
  // Remove commas and parse as float
  const cleaned = value.replace(/,/g, '');
  return parseFloat(cleaned) || 0;
}

// Format number for display with commas and decimal places
export function formatDisplayNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}
