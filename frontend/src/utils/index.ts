export function capitalizeWords(text: string | undefined): string {
  if (!text) return "";

  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export const formatPhoneNumber = (phoneNumber?: string) => {
  if (!phoneNumber) return "+256 XXX XXX XXX";

  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Format Ugandan numbers (+256...)
  if (cleaned.startsWith("256") && cleaned.length === 12) {
    return `+${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)} ${cleaned.substring(9)}`;
  }
  // Format international numbers (+...)
  else if (cleaned.startsWith("+") && cleaned.length === 13) {
    return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 10)} ${cleaned.substring(10)}`;
  }
  // Format local numbers (07...)
  else if (cleaned.startsWith("7") && cleaned.length === 9) {
    return `+256 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }

  // Return original if doesn't match expected formats
  return phoneNumber;
};

// utils/formatNumber.ts
export const formatNumber = (
  value?: number | string,
  defaultValue = 0
): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return (num || defaultValue).toLocaleString();
};

//  use it throughout your component:
// import { formatNumber } from '../utils/formatNumber';

// // Example usage:
// <Text style={styles.itemPrice}>
//   UGX {formatNumber(item.sellingPrice)} {item.unit ? `per ${item.unit}` : ''}
// </Text>


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const safeParseNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};
