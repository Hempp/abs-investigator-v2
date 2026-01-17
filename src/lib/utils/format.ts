/**
 * Format a number as currency (USD)
 */
export const formatCurrency = (
  amount: number,
  options?: { compact?: boolean; decimals?: number }
): string => {
  const { compact = false, decimals = 0 } = options || {};

  if (compact && amount >= 1000000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

/**
 * Format a date string for display
 */
export const formatDate = (
  dateString: string,
  options?: { format?: 'short' | 'medium' | 'long' | 'full' }
): string => {
  const { format = 'medium' } = options || {};

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return dateString;
    }

    const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
      short: { month: 'numeric', day: 'numeric', year: '2-digit' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { month: 'long', day: 'numeric', year: 'numeric' },
      full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    };

    return new Intl.DateTimeFormat('en-US', formatOptions[format]).format(date);
  } catch {
    return dateString;
  }
};

/**
 * Format a date for relative display (e.g., "2 days ago")
 */
export const formatRelativeDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch {
    return dateString;
  }
};

/**
 * Format a number with thousands separators
 */
export const formatNumber = (
  num: number,
  options?: { decimals?: number; compact?: boolean }
): string => {
  const { decimals = 0, compact = false } = options || {};

  if (compact) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num);
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

/**
 * Format percentage
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format a phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
};

/**
 * Format an address
 */
export const formatAddress = (parts: {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}): string => {
  const { street, city, state, zip } = parts;
  const cityStateZip = [city, state].filter(Boolean).join(', ');
  const fullCityLine = [cityStateZip, zip].filter(Boolean).join(' ');
  return [street, fullCityLine].filter(Boolean).join('\n');
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, length: number = 50): string => {
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Convert string to title case
 */
export const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format CUSIP for display
 */
export const formatCUSIPDisplay = (cusip: string): string => {
  if (cusip.length !== 9) return cusip;
  return `${cusip.slice(0, 6)}-${cusip.slice(6, 8)}-${cusip.slice(8)}`;
};
