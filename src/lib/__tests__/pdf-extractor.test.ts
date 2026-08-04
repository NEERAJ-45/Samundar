import { describe, it, expect } from 'vitest';
import { splitTextIntoChunks } from '@/lib/pdf-extractor';

describe('splitTextIntoChunks()', () => {
  it('returns no chunks for empty text', () => {
    expect(splitTextIntoChunks('')).toEqual([]);
    expect(splitTextIntoChunks('   \n\n  ')).toEqual([]);
  });

  it('splits long text into overlapping chunks', () => {
    const text = Array.from({ length: 120 }, (_, index) => `word${index}`).join(' ');
    const chunks = splitTextIntoChunks(text, { chunkSize: 120, overlap: 20 });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].index).toBe(0);
    expect(chunks[0].text.length).toBeLessThanOrEqual(120);
    expect(chunks[chunks.length - 1].index).toBe(chunks.length - 1);
    expect(chunks.every((chunk) => chunk.text.length > 0)).toBe(true);
  });

  it('rejects invalid chunk sizes and overlap values', () => {
    expect(() => splitTextIntoChunks('hello', { chunkSize: 0 })).toThrow(
      'chunkSize must be a positive number',
    );
    expect(() => splitTextIntoChunks('hello', { chunkSize: 100, overlap: -1 })).toThrow(
      'overlap must be a non-negative number',
    );
    expect(() => splitTextIntoChunks('hello', { chunkSize: 100, overlap: 100 })).toThrow(
      'overlap must be smaller than chunkSize',
    );
  });
});