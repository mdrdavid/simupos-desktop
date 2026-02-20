/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumberWithCommas(number: number) {
  // Check if the number is negative
  const isNegative = number < 0;
  // Convert the absolute value of the number to string
  const numberStr = Math.abs(number).toString();

  const chars = numberStr.split("");

  let count = 0;

  for (let i = chars.length - 1; i >= 0; i--) {
    count++;

    if (count % 3 === 0 && i !== 0) {
      chars.splice(i, 0, ",");
    }
  }
  let formattedNumber = chars.join("");

  // Reapply the negative sign if the number was negative
  if (isNegative) {
    formattedNumber = "-" + formattedNumber;
  }

  return formattedNumber;
}

export const formatValues = (values: Record<string, string>) => {
  return Object.entries(values)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

/**
 * Capitalizes the first letter of each word in a string
 *
 * @param text - The text to capitalize
 * @returns Text with first letter of each word capitalized
 */
export function capitalizeWords(text: string | undefined): string {
  if (!text) return "";

  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Generates initials from a name
 *
 * @param name - The name to generate initials from
 * @returns Initials (e.g., "John Doe" -> "JD")
 */
export function getInitials(name: string | undefined): string {
  if (!name) return "";

  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export const hasPermission = (
  userPermissions: any,
  requiredPermissions: any,
  requireAll: boolean = false,
): boolean => {
  if (requireAll) {
    return requiredPermissions.every((perm: any) =>
      userPermissions.includes(perm),
    );
  } else {
    // User must have at least ONE of the required permissions
    return requiredPermissions.some((perm: any) =>
      userPermissions.includes(perm),
    );
  }
};

export function formatCurrency(amount: number | undefined | null) {
  if (amount == null || isNaN(amount)) {
    return "UGX ---";
  }
  return `UGX ${amount.toLocaleString()}`;
}