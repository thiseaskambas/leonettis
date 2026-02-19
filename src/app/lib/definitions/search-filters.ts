import type { Selection } from '@heroui/react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterDef {
  id: string;
  label: string;
  selectionMode: 'single' | 'multiple';
  options: FilterOption[];
}

/**
 * Visibility rule: when `source` filter has a value selected, only
 * `mapping[value]` IDs are shown in the `target` filter.
 *
 * - When the source has NO selection → all target options are visible.
 * - For single-select sources the mapping is looked up directly.
 * - For multi-select sources the **union** of all matching mappings is used.
 * - When multiple rules target the same filter, the **intersection** of all
 *   rule results is used (every rule must agree).
 */
export interface VisibilityRule {
  source: string;
  target: string;
  mapping: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Option definitions — mirrors the union types in listing.types.ts
// ---------------------------------------------------------------------------

const CATEGORIES: FilterOption[] = [
  { id: 'residential', label: 'Residential' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'industrial', label: 'Industrial' },
  { id: 'agricultural', label: 'Agricultural' },
];

const PROPERTY_TYPES: FilterOption[] = [
  { id: 'apartment', label: 'Apartment' },
  { id: 'house', label: 'House' },
  { id: 'building', label: 'Building' },
  { id: 'office', label: 'Office' },
  { id: 'business', label: 'Business' },
  { id: 'warehouse', label: 'Warehouse' },
  { id: 'field', label: 'Field' },
  { id: 'land', label: 'Land' },
  { id: 'garage', label: 'Garage' },
];

const VIEW_TYPES: FilterOption[] = [
  { id: 'sea', label: 'Sea' },
  { id: 'mountain', label: 'Mountain' },
  { id: 'city', label: 'City' },
  { id: 'countryside', label: 'Countryside' },
  { id: 'lake', label: 'Lake' },
  { id: 'river', label: 'River' },
  { id: 'forest', label: 'Forest' },
  { id: 'park', label: 'Park' },
  { id: 'beach', label: 'Beach' },
  { id: 'other', label: 'Other' },
];

const AMENITIES: FilterOption[] = [
  { id: 'swimming pool', label: 'Swimming Pool' },
  { id: 'gym', label: 'Gym' },
  { id: 'jacuzzi', label: 'Jacuzzi' },
  { id: 'sauna', label: 'Sauna' },
  { id: 'steam room', label: 'Steam Room' },
  { id: 'tennis court', label: 'Tennis Court' },
  { id: 'golf course', label: 'Golf Course' },
  { id: 'parking', label: 'Parking' },
  { id: 'garage', label: 'Garage' },
  { id: 'terrace', label: 'Terrace' },
  { id: 'other', label: 'Other' },
];

const FEATURES: FilterOption[] = [
  { id: 'air conditioning', label: 'Air Conditioning' },
  { id: 'heating', label: 'Heating' },
  { id: 'fireplace', label: 'Fireplace' },
  { id: 'stove', label: 'Stove' },
  { id: 'balcony', label: 'Balcony' },
  { id: 'terrace', label: 'Terrace' },
  { id: 'garden', label: 'Garden' },
  { id: 'parking', label: 'Parking' },
  { id: 'garage', label: 'Garage' },
  { id: 'other', label: 'Other' },
];

const FURNISHING: FilterOption[] = [
  { id: 'furnished', label: 'Furnished' },
  { id: 'unfurnished', label: 'Unfurnished' },
  { id: 'partially furnished', label: 'Partially Furnished' },
  { id: 'other', label: 'Other' },
];

const SUITABLE_FOR: FilterOption[] = [
  { id: 'family', label: 'Family' },
  { id: 'couple', label: 'Couple' },
  { id: 'single', label: 'Single' },
  { id: 'business', label: 'Business' },
  { id: 'students', label: 'Students' },
  { id: 'investment', label: 'Investment' },
  { id: 'embassy', label: 'Embassy' },
  { id: 'vacation home', label: 'Vacation Home' },
  { id: 'other', label: 'Other' },
];

const ENERGY_RATINGS: FilterOption[] = [
  { id: 'A', label: 'A' },
  { id: 'B', label: 'B' },
  { id: 'C', label: 'C' },
  { id: 'D', label: 'D' },
  { id: 'E', label: 'E' },
  { id: 'F', label: 'F' },
  { id: 'G', label: 'G' },
];

const CONDITIONS: FilterOption[] = [
  { id: 'new', label: 'New' },
  { id: 'used', label: 'Used' },
  { id: 'renovated', label: 'Renovated' },
  { id: 'partially renovated', label: 'Partially Renovated' },
  { id: 'renovation needed', label: 'Renovation Needed' },
  { id: 'other', label: 'Other' },
];

// ---------------------------------------------------------------------------
// Filter definitions
// ---------------------------------------------------------------------------

export const FILTERS: FilterDef[] = [
  {
    id: 'category',
    label: 'Category',
    selectionMode: 'single',
    options: CATEGORIES,
  },
  {
    id: 'propertyType',
    label: 'Property Type',
    selectionMode: 'multiple',
    options: PROPERTY_TYPES,
  },
  {
    id: 'condition',
    label: 'Condition',
    selectionMode: 'multiple',
    options: CONDITIONS,
  },
  {
    id: 'furnishing',
    label: 'Furnishing',
    selectionMode: 'multiple',
    options: FURNISHING,
  },
  {
    id: 'energyRating',
    label: 'Energy Rating',
    selectionMode: 'multiple',
    options: ENERGY_RATINGS,
  },
  {
    id: 'viewType',
    label: 'View',
    selectionMode: 'multiple',
    options: VIEW_TYPES,
  },
  {
    id: 'features',
    label: 'Features',
    selectionMode: 'multiple',
    options: FEATURES,
  },
  {
    id: 'amenities',
    label: 'Amenities',
    selectionMode: 'multiple',
    options: AMENITIES,
  },
  {
    id: 'suitableFor',
    label: 'Suitable For',
    selectionMode: 'multiple',
    options: SUITABLE_FOR,
  },
];

// ---------------------------------------------------------------------------
// Visibility rules
//
// Add / edit entries here to control which options appear in downstream
// filters based on the current selection of a source filter.
// ---------------------------------------------------------------------------

export const VISIBILITY_RULES: VisibilityRule[] = [
  // ── Category → Property Type ──────────────────────────────────────────
  {
    source: 'category',
    target: 'propertyType',
    mapping: {
      residential: ['apartment', 'house', 'building', 'land', 'garage'],
      commercial: ['office', 'business', 'building', 'land', 'garage'],
      industrial: ['warehouse', 'building', 'land', 'garage'],
      agricultural: ['field', 'land'],
    },
  },

  // ── Category → Features ───────────────────────────────────────────────
  {
    source: 'category',
    target: 'features',
    mapping: {
      residential: [
        'air conditioning',
        'heating',
        'fireplace',
        'stove',
        'balcony',
        'terrace',
        'garden',
        'parking',
        'garage',
        'other',
      ],
      commercial: ['air conditioning', 'heating', 'parking', 'garage', 'other'],
      industrial: ['heating', 'parking', 'garage', 'other'],
      agricultural: ['garden', 'parking', 'other'],
    },
  },

  // ── Category → Amenities ──────────────────────────────────────────────
  {
    source: 'category',
    target: 'amenities',
    mapping: {
      residential: [
        'swimming pool',
        'gym',
        'jacuzzi',
        'sauna',
        'steam room',
        'tennis court',
        'golf course',
        'parking',
        'garage',
        'terrace',
        'other',
      ],
      commercial: ['parking', 'garage', 'other'],
      industrial: ['parking', 'garage', 'other'],
      agricultural: ['parking', 'other'],
    },
  },

  // ── Category → Suitable For ───────────────────────────────────────────
  {
    source: 'category',
    target: 'suitableFor',
    mapping: {
      residential: [
        'family',
        'couple',
        'single',
        'students',
        'investment',
        'vacation home',
        'embassy',
        'other',
      ],
      commercial: ['business', 'investment', 'other'],
      industrial: ['business', 'investment', 'other'],
      agricultural: ['investment', 'business', 'other'],
    },
  },

  // ── Category → Furnishing ────────────────────────────────────────────
  {
    source: 'category',
    target: 'furnishing',
    mapping: {
      residential: ['furnished', 'unfurnished', 'partially furnished', 'other'],
      commercial: ['furnished', 'unfurnished', 'other'],
      industrial: ['unfurnished', 'other'],
      agricultural: ['other'],
    },
  },

  // ── Category → View Type ──────────────────────────────────────────────
  {
    source: 'category',
    target: 'viewType',
    mapping: {
      residential: [
        'sea',
        'mountain',
        'city',
        'countryside',
        'lake',
        'river',
        'forest',
        'park',
        'beach',
        'other',
      ],
      commercial: ['sea', 'city', 'park', 'other'],
      industrial: ['city', 'other'],
      agricultural: [
        'countryside',
        'mountain',
        'sea',
        'lake',
        'river',
        'forest',
        'other',
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract selected IDs from a Selection value. */
export function getSelectedIds(selection: Selection | undefined): string[] {
  if (!selection || selection === 'all') return [];
  return [...selection].map(String);
}

/**
 * Compute which options should be visible for `filterId` given the current
 * `selections` state. Returns the full list when no constraining rule fires.
 */
export function getVisibleOptions(
  filterId: string,
  allOptions: FilterOption[],
  selections: Record<string, Selection>
): FilterOption[] {
  const rules = VISIBILITY_RULES.filter((r) => r.target === filterId);
  if (rules.length === 0) return allOptions;

  let allowedIds: Set<string> | null = null;

  for (const rule of rules) {
    const sourceIds = getSelectedIds(selections[rule.source]);
    if (sourceIds.length === 0) continue;

    const ruleAllowed = new Set<string>();
    for (const srcVal of sourceIds) {
      const mapped = rule.mapping[srcVal];
      if (mapped) mapped.forEach((id) => ruleAllowed.add(id));
    }

    if (ruleAllowed.size > 0) {
      const prev: Set<string> | null = allowedIds;
      allowedIds = prev
        ? new Set(Array.from<string>(prev).filter((id) => ruleAllowed.has(id)))
        : ruleAllowed;
    }
  }

  return allowedIds
    ? allOptions.filter((opt) => allowedIds.has(opt.id))
    : allOptions;
}

/**
 * Walk through every filter and drop selections that are no longer among the
 * visible options. Iterates in FILTERS order so cascading rules resolve
 * correctly (source filters are listed before their targets).
 */
export function pruneSelections(
  selections: Record<string, Selection>
): Record<string, Selection> {
  const next = { ...selections };

  for (const filter of FILTERS) {
    const visible = getVisibleOptions(filter.id, filter.options, next);
    const visibleIds = new Set(visible.map((o) => o.id));
    const current = next[filter.id];
    if (!current || current === 'all') continue;

    const currentSet = current as Set<string>;
    const pruned = new Set(
      [...currentSet].filter((k) => visibleIds.has(String(k)))
    );
    if (pruned.size !== currentSet.size) {
      next[filter.id] = pruned as Selection;
    }
  }

  return next;
}

/** Derive a human-readable label for a dropdown trigger button. */
export function getButtonLabel(
  filter: FilterDef,
  selection: Selection | undefined
): string {
  const ids = getSelectedIds(selection);
  if (ids.length === 0) return filter.label;

  const labels = filter.options
    .filter((opt) => ids.includes(opt.id))
    .map((opt) => opt.label);

  if (labels.length <= 2) return labels.join(', ');
  return `${labels.length} selected`;
}

/***
 * Convert search filter to URL params for GET requests APIs
 *
 */
export function selectionsToParams(
  listingType: string,
  selections: Record<string, Selection>
): URLSearchParams {
  const params = new URLSearchParams();
  params.set('listingType', listingType);

  for (const filter of FILTERS) {
    const ids = getSelectedIds(selections[filter.id]);
    if (ids.length > 0) {
      // multi-value params: ?propertyType=apartment&propertyType=house
      ids.forEach((id) => params.append(filter.id, id));
    }
  }

  return params;
}
