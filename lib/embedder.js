import { pipeline } from "@xenova/transformers";

// In-memory cache for the embedding pipeline across requests
let extractor = null;

async function getExtractor() {
  if (!extractor) {
    // Downloads model files once to cache, then runs locally in memory
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return extractor;
}

/**
 * Generates a normalized 384-dimensional vector embedding for any text
 * @param {string} text Text snippet or user query
 * @returns {Promise<number[]>} Array of 384 float numbers
 */
export async function getEmbedding(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Text is required for embedding generation.");
  }

  const pipe = await getExtractor();
  const cleaned = text.replace(/\n+/g, " ").trim();

  const output = await pipe(cleaned, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}
