export function getListingTitleEn(listing: { title?: unknown }): string {
  const title = listing.title;
  if (!title || typeof title !== 'object') {
    return 'Untitled listing';
  }

  const value = (title as { en?: unknown }).en;
  if (typeof value !== 'string') {
    return 'Untitled listing';
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : 'Untitled listing';
}

export function getListingCategoryLabel(listing: { category?: unknown }): string {
  if (!Array.isArray(listing.category)) {
    return 'N/A';
  }

  const values = listing.category.filter(
    (value): value is string => typeof value === 'string' && value.trim().length > 0
  );

  if (values.length === 0) {
    return 'N/A';
  }

  return values.join(', ');
}
