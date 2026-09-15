import { formatDistanceToNow, format, parseISO, Locale as DateFnsLocale } from 'date-fns';
import { arEG, enUS, de, ja, es } from 'date-fns/locale';
import { POINTS_PER_DOLLAR, pointsToCash as sharedPointsToCash } from '@cashdash/shared';

const dateLocales: Record<string, DateFnsLocale> = {
  ar: arEG,
  en: enUS,
  de: de,
  ja: ja,
  es: es,
};

/**
 * Format points with comma separators and "pts" suffix
 * e.g. 12450 -> "12,450 pts"
 */
export function formatPoints(points: number): string {
  return `${new Intl.NumberFormat('en-US').format(Math.round(points))} pts`;
}

/**
 * Format raw point count with commas (no suffix)
 * e.g. 12450 -> "12,450"
 */
export function formatPointsRaw(points: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(points));
}

/**
 * Format USD amount
 * e.g. 124.50 -> "$124.50"
 */
export function formatCash(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convert points to USD
 * e.g. 12450 -> 12.45
 */
export function pointsToCash(points: number): number {
  return sharedPointsToCash(points);
}

/**
 * Format points as cash value string
 * e.g. 12450 -> "$12.45"
 */
export function formatPointsAsCash(points: number): string {
  return formatCash(pointsToCash(points));
}

/**
 * Get relative time string
 * e.g. Date 2 hours ago -> "2 hours ago" or "منذ ساعتين"
 */
export function formatRelativeTime(date: string | Date, locale?: string): string {
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    const activeLocale = locale || (typeof document !== 'undefined' ? document.documentElement.lang : 'en');
    const dateFnsLoc = dateLocales[activeLocale] || enUS;
    return formatDistanceToNow(parsed, { addSuffix: true, locale: dateFnsLoc });
  } catch {
    return '';
  }
}

/**
 * Format date as readable string
 * e.g. "Sep 12, 2026"
 */
export function formatDate(date: string | Date): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return format(parsed, 'MMM d, yyyy');
}

/**
 * Format date and time
 * e.g. "Sep 12, 2026 at 2:30 PM"
 */
export function formatDateTime(date: string | Date): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return format(parsed, "MMM d, yyyy 'at' h:mm a");
}

/**
 * Format a percentage
 * e.g. 0.75 -> "75%"
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Abbreviate large numbers
 * e.g. 12450 -> "12.5K"
 */
export function formatCompactNumber(n: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(n);
}

/**
 * Points per dollar constant (re-exported for convenience)
 */
export { POINTS_PER_DOLLAR };
