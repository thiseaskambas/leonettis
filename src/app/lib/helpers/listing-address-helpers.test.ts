import { describe, expect, it } from 'vitest';

import {
  formatPublicAddress,
  resolveAddressCoordinates,
} from './listing-address-helpers';

describe('listing-address-helpers', () => {
  it.each([
    [undefined, { lat: 0, lng: 0 }],
    [{}, { lat: 0, lng: 0 }],
    [{ lat: 1 }, { lat: 1, lng: 0 }],
    [{ lng: 2 }, { lat: 0, lng: 2 }],
    [
      { lat: 37.1, lng: 25.2 },
      { lat: 37.1, lng: 25.2 },
    ],
  ])('resolveAddressCoordinates(%j) -> %j', (input, expected) => {
    expect(resolveAddressCoordinates(input)).toEqual(expected);
  });

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
