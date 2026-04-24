export type MediaFileLike = Pick<
  File,
  'name' | 'size' | 'lastModified' | 'type'
>;

export function getMediaFileKey(file: MediaFileLike): string {
  return `${file.name}:${file.size}:${file.lastModified}:${file.type}`;
}

export function mergeMediaFiles(existing: File[], incoming: File[]): File[] {
  const seen = new Set(existing.map((file) => getMediaFileKey(file)));
  const merged = [...existing];

  for (const file of incoming) {
    const fileKey = getMediaFileKey(file);
    if (seen.has(fileKey)) continue;

    seen.add(fileKey);
    merged.push(file);
  }

  return merged;
}

export function removeMediaFileByKey(files: File[], fileKey: string): File[] {
  return files.filter((file) => getMediaFileKey(file) !== fileKey);
}

export function clearMediaFiles(): File[] {
  return [];
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
