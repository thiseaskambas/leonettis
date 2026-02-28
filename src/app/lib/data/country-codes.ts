export interface CountryCode {
  dialCode: string;
  name: string;
  iso2: string;
  /** Example placeholder for national number (without country code). Shown in phone input when this country is selected. */
  phonePlaceholder?: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { dialCode: '+355', name: 'Albania', iso2: 'AL', phonePlaceholder: '6x xxx xxxx' },
  { dialCode: '+43', name: 'Austria', iso2: 'AT', phonePlaceholder: '660 1234567' },
  { dialCode: '+32', name: 'Belgium', iso2: 'BE', phonePlaceholder: '470 12 34 56' },
  { dialCode: '+387', name: 'Bosnia and Herzegovina', iso2: 'BA', phonePlaceholder: '6x xxx xxx' },
  { dialCode: '+359', name: 'Bulgaria', iso2: 'BG', phonePlaceholder: '87 123 4567' },
  { dialCode: '+385', name: 'Croatia', iso2: 'HR', phonePlaceholder: '92 123 4567' },
  { dialCode: '+357', name: 'Cyprus', iso2: 'CY', phonePlaceholder: '96 123456' },
  { dialCode: '+420', name: 'Czech Republic', iso2: 'CZ', phonePlaceholder: '601 123 456' },
  { dialCode: '+45', name: 'Denmark', iso2: 'DK', phonePlaceholder: '20 12 34 56' },
  { dialCode: '+372', name: 'Estonia', iso2: 'EE', phonePlaceholder: '5123 4567' },
  { dialCode: '+358', name: 'Finland', iso2: 'FI', phonePlaceholder: '40 123 4567' },
  { dialCode: '+33', name: 'France', iso2: 'FR', phonePlaceholder: '6 12 34 56 78' },
  { dialCode: '+49', name: 'Germany', iso2: 'DE', phonePlaceholder: '151 12345678' },
  { dialCode: '+30', name: 'Greece', iso2: 'GR', phonePlaceholder: '69x xxx xxxx' },
  { dialCode: '+36', name: 'Hungary', iso2: 'HU', phonePlaceholder: '20 123 4567' },
  { dialCode: '+354', name: 'Iceland', iso2: 'IS', phonePlaceholder: '611 1234' },
  { dialCode: '+353', name: 'Ireland', iso2: 'IE', phonePlaceholder: '85 123 4567' },
  { dialCode: '+39', name: 'Italy', iso2: 'IT', phonePlaceholder: '312 345 6789' },
  { dialCode: '+371', name: 'Latvia', iso2: 'LV', phonePlaceholder: '21 123 456' },
  { dialCode: '+423', name: 'Liechtenstein', iso2: 'LI', phonePlaceholder: '661 123 456' },
  { dialCode: '+370', name: 'Lithuania', iso2: 'LT', phonePlaceholder: '612 34567' },
  { dialCode: '+352', name: 'Luxembourg', iso2: 'LU', phonePlaceholder: '661 123 456' },
  { dialCode: '+356', name: 'Malta', iso2: 'MT', phonePlaceholder: '7912 3456' },
  { dialCode: '+373', name: 'Moldova', iso2: 'MD', phonePlaceholder: '621 12 345' },
  { dialCode: '+377', name: 'Monaco', iso2: 'MC', phonePlaceholder: '6 12 34 56 78' },
  { dialCode: '+382', name: 'Montenegro', iso2: 'ME', phonePlaceholder: '67 123 456' },
  { dialCode: '+31', name: 'Netherlands', iso2: 'NL', phonePlaceholder: '6 12 34 56 78' },
  { dialCode: '+389', name: 'North Macedonia', iso2: 'MK', phonePlaceholder: '72 123 456' },
  { dialCode: '+47', name: 'Norway', iso2: 'NO', phonePlaceholder: '406 12 345' },
  { dialCode: '+48', name: 'Poland', iso2: 'PL', phonePlaceholder: '512 345 678' },
  { dialCode: '+351', name: 'Portugal', iso2: 'PT', phonePlaceholder: '91 234 5678' },
  { dialCode: '+40', name: 'Romania', iso2: 'RO', phonePlaceholder: '712 345 678' },
  { dialCode: '+7', name: 'Russia', iso2: 'RU', phonePlaceholder: '912 345-67-89' },
  { dialCode: '+381', name: 'Serbia', iso2: 'RS', phonePlaceholder: '62 123 4567' },
  { dialCode: '+421', name: 'Slovakia', iso2: 'SK', phonePlaceholder: '912 123 456' },
  { dialCode: '+386', name: 'Slovenia', iso2: 'SI', phonePlaceholder: '31 234 567' },
  { dialCode: '+34', name: 'Spain', iso2: 'ES', phonePlaceholder: '612 34 56 78' },
  { dialCode: '+46', name: 'Sweden', iso2: 'SE', phonePlaceholder: '70 123 45 67' },
  { dialCode: '+41', name: 'Switzerland', iso2: 'CH', phonePlaceholder: '78 123 45 67' },
  { dialCode: '+90', name: 'Turkey', iso2: 'TR', phonePlaceholder: '532 123 45 67' },
  { dialCode: '+380', name: 'Ukraine', iso2: 'UA', phonePlaceholder: '67 123 4567' },
  { dialCode: '+44', name: 'United Kingdom', iso2: 'GB', phonePlaceholder: '7700 900123' },
  { dialCode: '+1', name: 'United States / Canada', iso2: 'US', phonePlaceholder: '(555) 123-4567' },
  { dialCode: '+61', name: 'Australia', iso2: 'AU', phonePlaceholder: '412 345 678' },
  { dialCode: '+55', name: 'Brazil', iso2: 'BR', phonePlaceholder: '11 91234-5678' },
  { dialCode: '+86', name: 'China', iso2: 'CN', phonePlaceholder: '138 0000 0000' },
  { dialCode: '+91', name: 'India', iso2: 'IN', phonePlaceholder: '98765 43210' },
  { dialCode: '+972', name: 'Israel', iso2: 'IL', phonePlaceholder: '50 123 4567' },
  { dialCode: '+81', name: 'Japan', iso2: 'JP', phonePlaceholder: '90 1234 5678' },
  { dialCode: '+52', name: 'Mexico', iso2: 'MX', phonePlaceholder: '55 1234 5678' },
  { dialCode: '+966', name: 'Saudi Arabia', iso2: 'SA', phonePlaceholder: '50 123 4567' },
  { dialCode: '+27', name: 'South Africa', iso2: 'ZA', phonePlaceholder: '82 123 4567' },
  { dialCode: '+82', name: 'South Korea', iso2: 'KR', phonePlaceholder: '10 1234 5678' },
  { dialCode: '+971', name: 'United Arab Emirates', iso2: 'AE', phonePlaceholder: '50 123 4567' },
];

/** Converts an ISO2 country code (e.g. 'GR') to a flag emoji (e.g. '🇬🇷') */
export function isoToFlagEmoji(iso2: string): string {
  return iso2
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(0x1f1e6 - 65 + char.charCodeAt(0)))
    .join('');
}
