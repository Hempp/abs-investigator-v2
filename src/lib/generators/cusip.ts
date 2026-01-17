import { TrustCUSIP } from '@/types';

/**
 * Generate a realistic CUSIP number based on trust prefix and series
 */
export const generateCUSIP = (prefix: string, year: string, series: string): string => {
  // Create a base from prefix (6 chars)
  const baseChars = prefix.padEnd(6, 'X').substring(0, 6).toUpperCase();

  // Year indicator (1 char)
  const yearChar = year.slice(-1);

  // Series indicator (1 char)
  const seriesChar = series.charAt(0).toUpperCase();

  // Random check digit (1 char)
  const checkDigit = Math.floor(Math.random() * 10).toString();

  return `${baseChars}${yearChar}${seriesChar}${checkDigit}`;
};

/**
 * Generate multiple CUSIP entries for a trust
 */
export const generateTrustCUSIPs = (
  prefix: string,
  year: string,
  seriesOptions: string[],
  trancheCount: number = 4
): TrustCUSIP[] => {
  const ratings = ['AAA', 'AA+', 'AA', 'A+', 'A', 'BBB+', 'BBB'];
  const tranches = ['A-1', 'A-2', 'A-3', 'M-1', 'M-2', 'B-1', 'B-2', 'C'];

  const cusips: TrustCUSIP[] = [];
  const series = seriesOptions[Math.floor(Math.random() * seriesOptions.length)];

  for (let i = 0; i < Math.min(trancheCount, tranches.length); i++) {
    cusips.push({
      cusip: generateCUSIP(prefix, year, `${series}${i}`),
      tranche: tranches[i],
      rating: ratings[Math.min(i, ratings.length - 1)],
      balance: Math.floor(Math.random() * 500000000) + 50000000, // $50M - $550M
    });
  }

  return cusips;
};

/**
 * Validate CUSIP format (basic validation)
 */
export const isValidCUSIP = (cusip: string): boolean => {
  // CUSIP is 9 characters: 6 alphanumeric + 2 alphanumeric + 1 check digit
  const cusipRegex = /^[A-Z0-9]{9}$/;
  return cusipRegex.test(cusip.toUpperCase());
};

/**
 * Parse CUSIP to extract components
 */
export const parseCUSIP = (cusip: string): {
  issuerCode: string;
  issueNumber: string;
  checkDigit: string;
} | null => {
  if (!isValidCUSIP(cusip)) return null;

  const upperCUSIP = cusip.toUpperCase();
  return {
    issuerCode: upperCUSIP.substring(0, 6),
    issueNumber: upperCUSIP.substring(6, 8),
    checkDigit: upperCUSIP.substring(8, 9),
  };
};

/**
 * Format CUSIP for display with spacing
 */
export const formatCUSIP = (cusip: string): string => {
  if (!isValidCUSIP(cusip)) return cusip;
  return `${cusip.substring(0, 6)}-${cusip.substring(6, 8)}-${cusip.substring(8)}`;
};
