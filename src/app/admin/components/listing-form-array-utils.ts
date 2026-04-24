function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

export function parseCommaSeparatedValues(input: string): string[] {
  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function mergeListingArrayValues(
  currentValues: string[] | undefined,
  incomingValues: string[],
  predefinedValues: readonly string[]
): string[] {
  const predefinedMap = new Map(
    predefinedValues.map((value) => [normalizeValue(value), value])
  );
  const merged = new Map<string, string>();

  for (const value of currentValues ?? []) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = normalizeValue(trimmed);
    merged.set(key, predefinedMap.get(key) ?? trimmed);
  }

  for (const value of incomingValues) {
    const trimmed = value.trim();
    if (!trimmed) continue;

    const key = normalizeValue(trimmed);
    if (predefinedMap.has(key)) continue;

    merged.set(key, trimmed);
  }

  return [...merged.values()];
}

export function getCustomListingValues(
  values: string[] | undefined,
  predefinedValues: readonly string[]
): string[] {
  const predefined = new Set(
    predefinedValues.map((value) => normalizeValue(value))
  );
  const customValues = new Map<string, string>();

  for (const value of values ?? []) {
    const trimmed = value.trim();
    if (!trimmed) continue;

    const key = normalizeValue(trimmed);
    if (predefined.has(key)) continue;

    customValues.set(key, trimmed);
  }

  return [...customValues.values()];
}

export function removeListingArrayValue(
  values: string[] | undefined,
  valueToRemove: string
): string[] {
  const removeKey = normalizeValue(valueToRemove);

  return (values ?? []).filter((value) => normalizeValue(value) !== removeKey);
}
