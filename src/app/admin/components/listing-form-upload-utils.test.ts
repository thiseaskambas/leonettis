import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildUrlWithoutMediaUploadParam,
  hasMediaUploadFailureWarning,
  uploadCreateMediaBatch,
  uploadWithXHR,
} from './listing-form-upload-utils';

type MockXhrInstance = {
  status: number;
  upload: { onprogress: ((event: ProgressEvent) => void) | null };
  onload: (() => void) | null;
  onerror: (() => void) | null;
  open: ReturnType<typeof vi.fn>;
  setRequestHeader: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
};

function createMockXhr(
  sendImpl: (xhr: MockXhrInstance) => void
): MockXhrInstance {
  const xhr: MockXhrInstance = {
    status: 200,
    upload: { onprogress: null },
    onload: null,
    onerror: null,
    open: vi.fn(),
    setRequestHeader: vi.fn(),
    send: vi.fn(function (this: MockXhrInstance) {
      sendImpl(this);
    }),
  };
  return xhr;
}

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

describe('uploadWithXHR', () => {
  const file = new File(['x'], 'clip.mp4', { type: 'video/mp4' });
  const url = 'https://bucket.example/presigned-put';
  const contentType = 'video/mp4';

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens PUT, sets Content-Type, sends file, and resolves on 2xx', async () => {
    const xhr = createMockXhr((instance) => {
      queueMicrotask(() => instance.onload?.());
    });
    vi.stubGlobal(
      'XMLHttpRequest',
      vi.fn(function MockXHR(this: MockXhrInstance) {
        Object.assign(this, xhr);
      }) as unknown as typeof XMLHttpRequest
    );

    await uploadWithXHR(url, file, contentType, vi.fn());

    expect(xhr.open).toHaveBeenCalledWith('PUT', url);
    expect(xhr.setRequestHeader).toHaveBeenCalledWith(
      'Content-Type',
      contentType
    );
    expect(xhr.send).toHaveBeenCalledWith(file);
  });

  it('calls onProgress when lengthComputable', async () => {
    const onProgress = vi.fn();
    const xhr = createMockXhr((instance) => {
      instance.upload.onprogress?.({
        lengthComputable: true,
        loaded: 50,
        total: 200,
      } as ProgressEvent);
      queueMicrotask(() => instance.onload?.());
    });
    vi.stubGlobal(
      'XMLHttpRequest',
      vi.fn(function MockXHR(this: MockXhrInstance) {
        Object.assign(this, xhr);
      }) as unknown as typeof XMLHttpRequest
    );

    await uploadWithXHR(url, file, contentType, onProgress);

    expect(onProgress).toHaveBeenCalledWith(25);
  });

  it('does not call onProgress when lengthComputable is false', async () => {
    const onProgress = vi.fn();
    const xhr = createMockXhr((instance) => {
      instance.upload.onprogress?.({
        lengthComputable: false,
      } as ProgressEvent);
      queueMicrotask(() => instance.onload?.());
    });
    vi.stubGlobal(
      'XMLHttpRequest',
      vi.fn(function MockXHR(this: MockXhrInstance) {
        Object.assign(this, xhr);
      }) as unknown as typeof XMLHttpRequest
    );

    await uploadWithXHR(url, file, contentType, onProgress);

    expect(onProgress).not.toHaveBeenCalled();
  });

  it('rejects on non-2xx status', async () => {
    const xhr = createMockXhr((instance) => {
      instance.status = 500;
      queueMicrotask(() => instance.onload?.());
    });
    vi.stubGlobal(
      'XMLHttpRequest',
      vi.fn(function MockXHR(this: MockXhrInstance) {
        Object.assign(this, xhr);
      }) as unknown as typeof XMLHttpRequest
    );

    await expect(
      uploadWithXHR(url, file, contentType, vi.fn())
    ).rejects.toThrow('Direct media upload failed');
  });

  it('rejects on xhr.onerror', async () => {
    const xhr = createMockXhr((instance) => {
      queueMicrotask(() => instance.onerror?.());
    });
    vi.stubGlobal(
      'XMLHttpRequest',
      vi.fn(function MockXHR(this: MockXhrInstance) {
        Object.assign(this, xhr);
      }) as unknown as typeof XMLHttpRequest
    );

    await expect(
      uploadWithXHR(url, file, contentType, vi.fn())
    ).rejects.toThrow('Direct media upload failed');
  });
});
