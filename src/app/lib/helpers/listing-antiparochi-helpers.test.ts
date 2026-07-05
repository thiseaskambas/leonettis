import { describe, expect, it } from 'vitest';

import {
  getAntiparochiQueryValues,
  isAntiparochiOption,
  normalizeAntiparochiSearchValues,
  sanitizeAntiparochi,
  supportsAntiparochi,
} from './listing-antiparochi-helpers';

describe('listing-antiparochi-helpers', () => {
  it('supports antiparochi for buy listings on eligible property types', () => {
    expect(supportsAntiparochi('buy', 'land')).toBe(true);
    expect(supportsAntiparochi('buy', 'field')).toBe(true);
    expect(supportsAntiparochi('buy', 'building')).toBe(true);
    expect(supportsAntiparochi('buy', 'house')).toBe(true);
  });

  it('does not support antiparochi for rent or non-development property types', () => {
    expect(supportsAntiparochi('rent', 'land')).toBe(false);
    expect(supportsAntiparochi('buy', 'apartment')).toBe(false);
    expect(supportsAntiparochi('buy', 'garage')).toBe(false);
  });

  it('sanitizes antiparochi values', () => {
    expect(sanitizeAntiparochi('accepted')).toBe('accepted');
    expect(sanitizeAntiparochi('only')).toBe('accepted');
    expect(sanitizeAntiparochi('negotiable')).toBe('accepted');
    expect(sanitizeAntiparochi('cash')).toBe(null);
    expect(sanitizeAntiparochi(null)).toBe(null);
  });

  it('detects valid antiparochi options', () => {
    expect(isAntiparochiOption('accepted')).toBe(true);
    expect(isAntiparochiOption('only')).toBe(true);
    expect(isAntiparochiOption('negotiable')).toBe(true);
    expect(isAntiparochiOption('cash')).toBe(false);
  });

  it('normalizes search values to the canonical option', () => {
    expect(normalizeAntiparochiSearchValues(['accepted'])).toEqual([
      'accepted',
    ]);
    expect(normalizeAntiparochiSearchValues(['only'])).toEqual(['accepted']);
    expect(normalizeAntiparochiSearchValues(['cash'])).toBeUndefined();
  });

  it('expands antiparochi queries to include legacy stored values', () => {
    expect(getAntiparochiQueryValues(['accepted'])).toEqual([
      'accepted',
      'only',
      'negotiable',
    ]);
    expect(getAntiparochiQueryValues(['cash'])).toEqual([]);
  });
});
