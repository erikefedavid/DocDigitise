/**
 * Splits extracted text into overlapping windows with sentence awareness
 * @param {string} text Full extracted text
 * @param {number} wordsPerChunk Maximum target words per chunk (default: 350)
 * @param {number} overlap Overlapping words between consecutive chunks (default: 40)
 * @returns {Array<{ chunkIndex: number, text: string }>}
 */
export function chunkTextWithOverlap(text, wordsPerChunk = 350, overlap = 40) {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return [];
  }

  const words = text.trim().split(/\s+/);
  if (words.length <= wordsPerChunk) {
    return [{ chunkIndex: 0, text: words.join(" ") }];
  }

  const chunks = [];
  let chunkIndex = 0;
  const step = Math.max(1, wordsPerChunk - overlap);

  for (let i = 0; i < words.length; i += step) {
    const chunkWords = words.slice(i, i + wordsPerChunk);
    chunks.push({
      chunkIndex: chunkIndex++,
      text: chunkWords.join(" "),
    });

    if (i + wordsPerChunk >= words.length) {
      break;
    }
  }

  return chunks;
}
