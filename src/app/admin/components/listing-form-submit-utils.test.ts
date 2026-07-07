import { describe, expect, it } from 'vitest';

import type { ListingFormLocalizedText } from './listing-form-submit-utils';
import {
  getTitleTranslationSourceLocale,
  hasInvalidManualCreateSlug,
  mergeRequiredEnglishTitleTranslation,
} from './listing-form-submit-utils';

const emptyTitle = (): ListingFormLocalizedText => ({
  en: '',
  fr: '',
  gr: '',
  de: '',
  it: '',
});

describe('listing-form-submit-utils', () => {
  it('returns no translation source when no non-english title is filled', () => {
    const title = { ...emptyTitle(), en: 'Beach Villa' };

    expect(getTitleTranslationSourceLocale(title, 'en')).toBeNull();
  });

  it('prefers the active non-english locale when it has a title', () => {
    const title = {
      ...emptyTitle(),
      fr: 'Villa francaise',
      gr: 'Βίλα στην Πάρο',
    };

    expect(getTitleTranslationSourceLocale(title, 'gr')).toBe('gr');
  });

  it('falls back to the first filled non-english title locale', () => {
    const title = { ...emptyTitle(), de: 'Schoene Villa' };

    expect(getTitleTranslationSourceLocale(title, 'en')).toBe('de');
  });

  it('requires translation output to include a non-empty english title', () => {
    const title = { ...emptyTitle(), gr: 'Βίλα στην Πάρο' };

    expect(
      mergeRequiredEnglishTitleTranslation(title, { fr: 'Villa a Paros' })
    ).toBeNull();
    expect(
      mergeRequiredEnglishTitleTranslation(title, { en: '   ' })
    ).toBeNull();
  });

  it('merges title translations when english title is present', () => {
    const title = { ...emptyTitle(), gr: 'Βίλα στην Πάρο' };

    expect(
      mergeRequiredEnglishTitleTranslation(title, {
        en: '  Villa in Paros  ',
        fr: 'Villa a Paros',
      })
    ).toEqual({
      ...title,
      en: 'Villa in Paros',
      fr: 'Villa a Paros',
    });
  });

  it('detects invalid non-empty manual create slugs', () => {
    expect(hasInvalidManualCreateSlug('create', '!!!', true)).toBe(true);
    expect(hasInvalidManualCreateSlug('create', '', true)).toBe(false);
    expect(hasInvalidManualCreateSlug('create', 'Beach House', true)).toBe(
      false
    );
    expect(hasInvalidManualCreateSlug('edit', '!!!', true)).toBe(false);
  });
});
