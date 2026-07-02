import { describe, expect, it } from 'vitest';

import {
  isAntiparochiOption,
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
    expect(sanitizeAntiparochi('only')).toBe('only');
    expect(sanitizeAntiparochi('negotiable')).toBe('negotiable');
    expect(sanitizeAntiparochi('cash')).toBe(null);
    expect(sanitizeAntiparochi(null)).toBe(null);
  });

  it('detects valid antiparochi options', () => {
    expect(isAntiparochiOption('only')).toBe(true);
    expect(isAntiparochiOption('negotiable')).toBe(true);
    expect(isAntiparochiOption('cash')).toBe(false);
  });
});
