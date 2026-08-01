import { readFile } from 'fs/promises';

export interface TextChunkOptions {
  chunkSize?: number;
  overlap?: number;
}

export interface TextChunk {
  index: number;
  text: string;
}

export function splitTextIntoChunks(
  text: string,
  options: TextChunkOptions = {},
): TextChunk[] {
  const chunkSize = options.chunkSize ?? 1200;
  const overlap = options.overlap ?? 150;

  if (!Number.isFinite(chunkSize) || chunkSize <= 0) {
    throw new Error('chunkSize must be a positive number');
  }

  if (!Number.isFinite(overlap) || overlap < 0) {
    throw new Error('overlap must be a non-negative number');
  }

  if (overlap >= chunkSize) {
    throw new Error('overlap must be smaller than chunkSize');
  }

  const normalizedText = text.replace(/\r\n/g, '\n').trim();
  if (!normalizedText) return [];

  const chunks: TextChunk[] = [];
  let cursor = 0;

  while (cursor < normalizedText.length) {
    let end = Math.min(cursor + chunkSize, normalizedText.length);

    if (end < normalizedText.length) {
      const boundary = normalizedText.lastIndexOf(' ', end);
      if (boundary > cursor + Math.floor(chunkSize * 0.5)) {
        end = boundary;
      }
    }

    const chunkText = normalizedText.slice(cursor, end).trim();
    if (chunkText) {
      chunks.push({ index: chunks.length, text: chunkText });
    }

    if (end >= normalizedText.length) break;

    const nextCursor = Math.max(end - overlap, cursor + 1);
    cursor = nextCursor;
  }

  return chunks;
}

export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    parser.destroy();
    return result.text || '';
  } catch (e) {
    console.error('[pdf-extractor] extractTextFromPdfBuffer failed:', (e as Error).message);
    return '';
  }
}

export async function extractTextFromPdfPath(filePath: string): Promise<string> {
  try {
    const buffer = await readFile(filePath);
    return extractTextFromPdfBuffer(buffer);
  } catch (e) {
    console.error('[pdf-extractor] extractTextFromPdfPath failed:', (e as Error).message);
    return '';
  }
}
