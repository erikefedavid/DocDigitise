import { getEmbedding } from "@/lib/embedder";
import Chunk from "@/models/Chunk";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const PRIMARY_MODEL = "qwen/qwen3.8-27b";
const FALLBACK_MODEL = "openai/gpt-oss-120b";

/**
 * Calculates cosine similarity between two unit-normalized vectors (dot product)
 */
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return dot;
}

/**
 * Retrieves the most semantically relevant text chunks for a user question
 * @param {string} documentId Mongo Document ObjectId
 * @param {string} question Natural language user query
 * @param {number} topK Number of chunks to retrieve (default: 3)
 */
export async function retrieveContextChunks(documentId, question, topK = 3) {
  const queryEmbedding = await getEmbedding(question);

  // Fetch all chunks for this specific document
  const chunks = await Chunk.find({ documentId }).lean();
  if (!chunks || chunks.length === 0) {
    return [];
  }

  // Rank by cosine similarity
  const scoredChunks = chunks.map((c) => ({
    chunkIndex: c.chunkIndex,
    pageNumber: c.pageNumber || 1,
    text: c.text,
    similarity: cosineSimilarity(queryEmbedding, c.embedding),
  }));

  scoredChunks.sort((a, b) => b.similarity - a.similarity);
  return scoredChunks.slice(0, topK);
}

/**
 * Executes grounded RAG Q&A with strict factual attribution
 */
export async function askGroundedDocument(documentId, fallbackText, question) {
  const relevantChunks = await retrieveContextChunks(documentId, question, 3);

  let context = "";
  let sources = [];

  if (relevantChunks.length > 0) {
    context = relevantChunks
      .map(
        (c) =>
          `[Source: Page ${c.pageNumber}, Section ${c.chunkIndex + 1}]\n${c.text}`
      )
      .join("\n\n---\n\n");

    sources = relevantChunks.map((c) => ({
      pageNumber: c.pageNumber,
      chunkIndex: c.chunkIndex,
      similarity: Number(c.similarity.toFixed(3)),
      snippet: c.text.slice(0, 120) + "...",
    }));
  } else {
    // Graceful fallback for legacy documents ingested before RAG
    context =
      fallbackText && fallbackText.length > 12000
        ? fallbackText.substring(0, 12000) + "..."
        : fallbackText || "No text available.";
  }

  const systemPrompt = `You are a precise, grounded document intelligence assistant.
Answer the user's question using ONLY the provided document context excerpts.
Rules:
1. Ground every claim directly in the text.
2. If the answer is not in the text, state: "❌ This information is not found in the uploaded document."
3. At the end of your answer, list the exact Page number(s) cited.
4. Keep the response concise, authoritative, and helpful.`;

  const messages = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Document Context:\n${context}\n\nUser Question: ${question}`,
    },
  ];

  let response;
  try {
    response = await client.chat.completions.create({
      model: PRIMARY_MODEL,
      messages,
      max_tokens: 1000,
      temperature: 0.2, // Near zero for factual grounding
    });
  } catch (err) {
    console.warn("Primary RAG model error, falling back:", err.message);
    response = await client.chat.completions.create({
      model: FALLBACK_MODEL,
      messages,
      max_tokens: 1500,
      temperature: 0.2,
    });
  }

  const answer = response.choices?.[0]?.message?.content?.trim();

  return {
    answer: answer || "❌ Could not generate an answer.",
    sources,
  };
}
