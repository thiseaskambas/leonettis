export interface UploadCreateMediaBatchResult {
  attempted: number;
  succeeded: number;
  failed: number;
}

interface UploadCreateMediaBatchOptions<TFile> {
  files: readonly TFile[];
  uploadFile: (file: TFile) => Promise<void>;
  onFileStart?: (file: TFile) => void;
}

interface SearchParamsLike {
  toString(): string;
}

export function hasMediaUploadFailureWarning(
  mediaUploadValue: string | null
): boolean {
  return mediaUploadValue === 'failed';
}

export function buildUrlWithoutMediaUploadParam(
  pathname: string,
  searchParams: SearchParamsLike
): string {
  const nextSearchParams = new URLSearchParams(searchParams.toString());
  nextSearchParams.delete('mediaUpload');

  const nextSearch = nextSearchParams.toString();
  return nextSearch ? `${pathname}?${nextSearch}` : pathname;
}

export async function uploadCreateMediaBatch<TFile>({
  files,
  uploadFile,
  onFileStart,
}: UploadCreateMediaBatchOptions<TFile>): Promise<UploadCreateMediaBatchResult> {
  let succeeded = 0;
  let failed = 0;

  for (const file of files) {
    onFileStart?.(file);

    try {
      await uploadFile(file);
      succeeded += 1;
    } catch {
      failed += 1;
    }
  }

  return {
    attempted: files.length,
    succeeded,
    failed,
  };
}
