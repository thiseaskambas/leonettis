import { describe, expect, it } from 'vitest';

import { formatPublicAddress } from './listing-address-helpers';

describe('listing-address-helpers', () => {
  it('formats city, region, and state when available', () => {
    expect(
      formatPublicAddress({
        city: 'Marpissa',
        region: 'Paros',
        state: 'South Aegean',
        zipCode: '',
        country: '',
        coordinates: { lat: 0, lng: 0 },
      })
    ).toBe('Marpissa, Paros, South Aegean');
  });

  it('omits missing fields without dangling separators', () => {
    expect(
      formatPublicAddress({
        city: 'Marpissa',
        zipCode: '',
        country: '',
        coordinates: { lat: 0, lng: 0 },
      })
    ).toBe('Marpissa');
  });
});
