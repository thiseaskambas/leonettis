export interface CountryCode {
  dialCode: string;
  name: string;
  iso2: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { dialCode: '+355', name: 'Albania', iso2: 'AL' },
  { dialCode: '+43', name: 'Austria', iso2: 'AT' },
  { dialCode: '+32', name: 'Belgium', iso2: 'BE' },
  { dialCode: '+387', name: 'Bosnia and Herzegovina', iso2: 'BA' },
  { dialCode: '+359', name: 'Bulgaria', iso2: 'BG' },
  { dialCode: '+385', name: 'Croatia', iso2: 'HR' },
  { dialCode: '+357', name: 'Cyprus', iso2: 'CY' },
  { dialCode: '+420', name: 'Czech Republic', iso2: 'CZ' },
  { dialCode: '+45', name: 'Denmark', iso2: 'DK' },
  { dialCode: '+372', name: 'Estonia', iso2: 'EE' },
  { dialCode: '+358', name: 'Finland', iso2: 'FI' },
  { dialCode: '+33', name: 'France', iso2: 'FR' },
  { dialCode: '+49', name: 'Germany', iso2: 'DE' },
  { dialCode: '+30', name: 'Greece', iso2: 'GR' },
  { dialCode: '+36', name: 'Hungary', iso2: 'HU' },
  { dialCode: '+354', name: 'Iceland', iso2: 'IS' },
  { dialCode: '+353', name: 'Ireland', iso2: 'IE' },
  { dialCode: '+39', name: 'Italy', iso2: 'IT' },
  { dialCode: '+371', name: 'Latvia', iso2: 'LV' },
  { dialCode: '+423', name: 'Liechtenstein', iso2: 'LI' },
  { dialCode: '+370', name: 'Lithuania', iso2: 'LT' },
  { dialCode: '+352', name: 'Luxembourg', iso2: 'LU' },
  { dialCode: '+356', name: 'Malta', iso2: 'MT' },
  { dialCode: '+373', name: 'Moldova', iso2: 'MD' },
  { dialCode: '+377', name: 'Monaco', iso2: 'MC' },
  { dialCode: '+382', name: 'Montenegro', iso2: 'ME' },
  { dialCode: '+31', name: 'Netherlands', iso2: 'NL' },
  { dialCode: '+389', name: 'North Macedonia', iso2: 'MK' },
  { dialCode: '+47', name: 'Norway', iso2: 'NO' },
  { dialCode: '+48', name: 'Poland', iso2: 'PL' },
  { dialCode: '+351', name: 'Portugal', iso2: 'PT' },
  { dialCode: '+40', name: 'Romania', iso2: 'RO' },
  { dialCode: '+7', name: 'Russia', iso2: 'RU' },
  { dialCode: '+381', name: 'Serbia', iso2: 'RS' },
  { dialCode: '+421', name: 'Slovakia', iso2: 'SK' },
  { dialCode: '+386', name: 'Slovenia', iso2: 'SI' },
  { dialCode: '+34', name: 'Spain', iso2: 'ES' },
  { dialCode: '+46', name: 'Sweden', iso2: 'SE' },
  { dialCode: '+41', name: 'Switzerland', iso2: 'CH' },
  { dialCode: '+90', name: 'Turkey', iso2: 'TR' },
  { dialCode: '+380', name: 'Ukraine', iso2: 'UA' },
  { dialCode: '+44', name: 'United Kingdom', iso2: 'GB' },
  { dialCode: '+1', name: 'United States / Canada', iso2: 'US' },
  { dialCode: '+61', name: 'Australia', iso2: 'AU' },
  { dialCode: '+55', name: 'Brazil', iso2: 'BR' },
  { dialCode: '+86', name: 'China', iso2: 'CN' },
  { dialCode: '+91', name: 'India', iso2: 'IN' },
  { dialCode: '+972', name: 'Israel', iso2: 'IL' },
  { dialCode: '+81', name: 'Japan', iso2: 'JP' },
  { dialCode: '+52', name: 'Mexico', iso2: 'MX' },
  { dialCode: '+966', name: 'Saudi Arabia', iso2: 'SA' },
  { dialCode: '+27', name: 'South Africa', iso2: 'ZA' },
  { dialCode: '+82', name: 'South Korea', iso2: 'KR' },
  { dialCode: '+971', name: 'United Arab Emirates', iso2: 'AE' },
];

/** Converts an ISO2 country code (e.g. 'GR') to a flag emoji (e.g. '🇬🇷') */
export function isoToFlagEmoji(iso2: string): string {
  return iso2
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(0x1f1e6 - 65 + char.charCodeAt(0)))
    .join('');
}
