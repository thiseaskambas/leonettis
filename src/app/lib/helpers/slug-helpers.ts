const GREEK_MAP: Record<string, string> = {
  α: 'a',
  β: 'v',
  γ: 'g',
  δ: 'd',
  ε: 'e',
  ζ: 'z',
  η: 'i',
  θ: 'th',
  ι: 'i',
  κ: 'k',
  λ: 'l',
  μ: 'm',
  ν: 'n',
  ξ: 'x',
  ο: 'o',
  π: 'p',
  ρ: 'r',
  σ: 's',
  ς: 's',
  τ: 't',
  υ: 'y',
  φ: 'f',
  χ: 'ch',
  ψ: 'ps',
  ω: 'o',
  ά: 'a',
  έ: 'e',
  ή: 'i',
  ί: 'i',
  ό: 'o',
  ύ: 'y',
  ώ: 'o',
  ϊ: 'i',
  ϋ: 'y',
  ΐ: 'i',
  ΰ: 'y',
  Α: 'A',
  Β: 'V',
  Γ: 'G',
  Δ: 'D',
  Ε: 'E',
  Ζ: 'Z',
  Η: 'I',
  Θ: 'Th',
  Ι: 'I',
  Κ: 'K',
  Λ: 'L',
  Μ: 'M',
  Ν: 'N',
  Ξ: 'X',
  Ο: 'O',
  Π: 'P',
  Ρ: 'R',
  Σ: 'S',
  Τ: 'T',
  Υ: 'Y',
  Φ: 'F',
  Χ: 'Ch',
  Ψ: 'Ps',
  Ω: 'O',
  Ά: 'A',
  Έ: 'E',
  Ή: 'I',
  Ί: 'I',
  Ό: 'O',
  Ύ: 'Y',
  Ώ: 'O',
};

const SPECIAL_CHARS: Record<string, string> = {
  ß: 'ss',
  æ: 'ae',
  Æ: 'Ae',
  ø: 'o',
  Ø: 'O',
  ð: 'd',
  þ: 'th',
};

export function transliterate(input: string): string {
  return input
    .split('')
    .map((char) => GREEK_MAP[char] ?? SPECIAL_CHARS[char] ?? char)
    .join('')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function slugify(input: string): string {
  return transliterate(input)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
