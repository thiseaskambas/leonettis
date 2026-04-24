import { describe, expect, it, vi } from 'vitest';

import {
  buildUrlWithoutMediaUploadParam,
  hasMediaUploadFailureWarning,
  uploadCreateMediaBatch,
} from './listing-form-upload-utils';

describe('listing-form-upload-utils', () => {
  it('continues uploading remaining files after a failed file', async () => {
    const files = [{ name: 'first' }, { name: 'bad' }, { name: 'last' }];
    const uploadedNames: string[] = [];
    const startedNames: string[] = [];

    const result = await uploadCreateMediaBatch({
      files,
      onFileStart: (file) => {
        startedNames.push(file.name);
      },
      uploadFile: async (file) => {
        if (file.name === 'bad') {
          throw new Error('simulated upload failure');
        }
        uploadedNames.push(file.name);
      },
    });

    expect(startedNames).toEqual(['first', 'bad', 'last']);
    expect(uploadedNames).toEqual(['first', 'last']);
    expect(result).toEqual({
      attempted: 3,
      succeeded: 2,
      failed: 1,
    });
  });

  it('reports no failures when all uploads succeed', async () => {
    const uploadFile = vi.fn(async () => Promise.resolve());

    const result = await uploadCreateMediaBatch({
      files: [{ name: 'a' }, { name: 'b' }],
      uploadFile,
    });

    expect(uploadFile).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      attempted: 2,
      succeeded: 2,
      failed: 0,
    });
  });

  it('detects failed media upload warning query value', () => {
    expect(hasMediaUploadFailureWarning('failed')).toBe(true);
    expect(hasMediaUploadFailureWarning('ok')).toBe(false);
    expect(hasMediaUploadFailureWarning(null)).toBe(false);
  });

  it('removes mediaUpload query param while preserving other params', () => {
    const searchParams = new URLSearchParams(
      'mediaUpload=failed&tab=media&section=videos'
    );

    expect(
      buildUrlWithoutMediaUploadParam(
        '/admin/listings/listing-1/edit',
        searchParams
      )
    ).toBe('/admin/listings/listing-1/edit?tab=media&section=videos');
  });

  it('returns pathname when mediaUpload is the only query param', () => {
    const searchParams = new URLSearchParams('mediaUpload=failed');

    expect(
      buildUrlWithoutMediaUploadParam(
        '/admin/listings/listing-1/edit',
        searchParams
      )
    ).toBe('/admin/listings/listing-1/edit');
  });
});
