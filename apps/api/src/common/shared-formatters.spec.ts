import { describe, it, expect } from 'vitest';
import {
  pointsToCash,
  cashToPoints,
  formatPoints,
  formatCash,
  POINTS_PER_DOLLAR,
} from '@cashdash/shared';

describe('Shared Point & Cash Conversion Helpers', () => {
  it('should convert points to cash accurately with default rate (10,000 pts = $1.00)', () => {
    expect(pointsToCash(10000)).toBe(1.0);
    expect(pointsToCash(25000)).toBe(2.5);
    expect(pointsToCash(5000)).toBe(0.5);
    expect(pointsToCash(0)).toBe(0);
    expect(pointsToCash(100000)).toBe(10.0);
  });

  it('should convert cash to points accurately with default rate', () => {
    expect(cashToPoints(1.0)).toBe(10000);
    expect(cashToPoints(2.5)).toBe(25000);
    expect(cashToPoints(0.5)).toBe(5000);
    expect(cashToPoints(0)).toBe(0);
    expect(cashToPoints(10.0)).toBe(100000);
  });

  it('should support dynamic database-configured conversion rates', () => {
    const customRate = 5000; // 5,000 pts = $1.00
    expect(pointsToCash(10000, customRate)).toBe(2.0);
    expect(cashToPoints(2.0, customRate)).toBe(10000);

    const higherRate = 20000; // 20,000 pts = $1.00
    expect(pointsToCash(10000, higherRate)).toBe(0.5);
    expect(cashToPoints(0.5, higherRate)).toBe(10000);
  });

  it('should format points with proper thousands separators', () => {
    expect(formatPoints(1000)).toBe('1,000');
    expect(formatPoints(1000000)).toBe('1,000,000');
    expect(formatPoints(500)).toBe('500');
    expect(formatPoints(0)).toBe('0');
  });

  it('should format cash with USD currency symbols and 2 decimal places', () => {
    expect(formatCash(1)).toBe('$1.00');
    expect(formatCash(2.5)).toBe('$2.50');
    expect(formatCash(0)).toBe('$0.00');
    expect(formatCash(1250.75)).toBe('$1,250.75');
  });
});
