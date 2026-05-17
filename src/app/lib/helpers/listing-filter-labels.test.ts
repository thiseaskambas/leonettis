import { describe, expect, it } from 'vitest';

import {
  getListingOptionLabels,
  normalizeListingLabelKey,
} from './listing-filter-labels';

describe('listing-filter-labels', () => {
  it('normalizes spaces and underscores to hyphens', () => {
    expect(normalizeListingLabelKey('air conditioning')).toBe(
      'air-conditioning'
    );
    expect(normalizeListingLabelKey('under_offer')).toBe('under-offer');
    expect(normalizeListingLabelKey('vacation home')).toBe('vacation-home');
  });

  it('uses public site Greek strings for property types', () => {
    const gr = getListingOptionLabels('gr');
    expect(gr.propertyTypes.apartment).toBe('Διαμέρισμα');
    expect(gr.propertyTypes.garage).toBe('Γκαράζ');
    expect(gr.categories.residential).toBe('Κατοικία');
    expect(gr.listingTypes.buy).toBe('Αγορά');
  });

  it('uses public site Greek strings for features and amenities', () => {
    const gr = getListingOptionLabels('gr');
    expect(gr.featureOptions['air conditioning']).toBe('Κλιματισμός');
    expect(gr.featureOptions.terrace).toBe('Ταράτσα');
    expect(gr.amenityOptions['steam room']).toBe('Χαμάμ');
    expect(gr.suitableForOptions['vacation home']).toBe('Εξοχική Κατοικία');
  });

  it('uses public site status strings where defined', () => {
    const gr = getListingOptionLabels('gr');
    expect(gr.statuses.sold).toBe('Πωλήθηκε');
    expect(gr.statuses.under_offer).toBe('Υπό συζήτηση');
  });
});
