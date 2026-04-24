import { describe, expect, it } from 'vitest';

import {
  clearMediaFiles,
  formatFileSize,
  getMediaFileKey,
  mergeMediaFiles,
  removeMediaFileByKey,
} from './listing-form-media-utils';

function createFile(
  name: string,
  options: { size: number; type: string; lastModified: number }
): File {
  const blob = new Uint8Array(options.size || 1);
  return new File([blob], name, {
    type: options.type,
    lastModified: options.lastModified,
  });
}

describe('listing-form-media-utils', () => {
  it('appends newly selected files to existing selection', () => {
    const first = createFile('a.jpg', {
      size: 1200,
      type: 'image/jpeg',
      lastModified: 1,
    });
    const second = createFile('b.mp4', {
      size: 2300,
      type: 'video/mp4',
      lastModified: 2,
    });

    const merged = mergeMediaFiles([first], [second]);
    expect(merged).toEqual([first, second]);
  });

  it('deduplicates files selected multiple times', () => {
    const first = createFile('a.jpg', {
      size: 1200,
      type: 'image/jpeg',
      lastModified: 1,
    });
    const sameFirstAgain = createFile('a.jpg', {
      size: 1200,
      type: 'image/jpeg',
      lastModified: 1,
    });

    const merged = mergeMediaFiles([first], [sameFirstAgain]);
    expect(merged).toHaveLength(1);
    expect(merged[0]).toBe(first);
  });

  it('removes one file by key', () => {
    const first = createFile('a.jpg', {
      size: 1200,
      type: 'image/jpeg',
      lastModified: 1,
    });
    const second = createFile('b.mp4', {
      size: 2300,
      type: 'video/mp4',
      lastModified: 2,
    });

    const next = removeMediaFileByKey([first, second], getMediaFileKey(first));
    expect(next).toEqual([second]);
  });

  it('supports clear-all by resetting list to empty state', () => {
    const first = createFile('a.jpg', {
      size: 1200,
      type: 'image/jpeg',
      lastModified: 1,
    });
    const second = createFile('b.mp4', {
      size: 2300,
      type: 'video/mp4',
      lastModified: 2,
    });

    const cleared = clearMediaFiles();
    expect(cleared).toEqual([]);
    expect(cleared).toHaveLength(0);
    expect([first, second]).toHaveLength(2);
  });

  it('formats file sizes for display', () => {
    expect(formatFileSize(999)).toBe('999 B');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(2 * 1024 * 1024)).toBe('2.0 MB');
  });
});
