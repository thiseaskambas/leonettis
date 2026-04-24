import { describe, expect, it } from 'vitest';

import {
  getCustomListingValues,
  mergeListingArrayValues,
  parseCommaSeparatedValues,
  removeListingArrayValue,
} from './listing-form-array-utils';

describe('listing-form-array-utils', () => {
  it('parses comma separated text into trimmed values', () => {
    expect(
      parseCommaSeparatedValues(' roof top,  bbq area, , pergola ')
    ).toEqual(['roof top', 'bbq area', 'pergola']);
  });

  it('merges custom values and deduplicates case-insensitively', () => {
    const merged = mergeListingArrayValues(
      ['garden', 'Roof Deck', 'roof deck'],
      ['ROOF DECK', 'Wine Cellar'],
      ['garden', 'parking']
    );

    expect(merged).toEqual(['garden', 'ROOF DECK', 'Wine Cellar']);
  });

  it('ignores incoming values that match predefined options', () => {
    const merged = mergeListingArrayValues(
      ['parking'],
      ['PARKING', 'covered patio'],
      ['garden', 'parking']
    );

    expect(merged).toEqual(['parking', 'covered patio']);
  });

  it('extracts only custom values from listing arrays', () => {
    expect(
      getCustomListingValues(
        ['garden', ' roof deck ', 'ROOF DECK', 'parking', 'private dock'],
        ['garden', 'parking']
      )
    ).toEqual(['ROOF DECK', 'private dock']);
  });

  it('removes one custom value case-insensitively', () => {
    expect(
      removeListingArrayValue(
        ['garden', 'Roof Deck', 'private dock'],
        'roof deck'
      )
    ).toEqual(['garden', 'private dock']);
  });
});
