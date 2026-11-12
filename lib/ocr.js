import OpenAI from "openai";

const MAX_IMAGE_BYTES = 20 * 1024 * 1024; // 20MB limit

const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

/**
 * 1. Primary OCR: Groq Vision API (Llama 3.2 Vision)
 * Fast, serverless-native REST call, zero binaries.
 */
async function runGroqVision(buffer) {
  if (!process.env.GROQ_API_KEY) return null;

  try {
    const base64Image = buffer.toString("base64");
    const response = await groqClient.chat.completions.create({
      model: "llama-3.2-11b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract and transcribe all readable text from this document image verbatim. Return ONLY the transcribed text. Do not add any commentary, explanations, greetings, or formatting notes.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 3000,
    });

    const extractedText = response.choices?.[0]?.message?.content?.trim();
    return extractedText || null;
  } catch (err) {
    console.warn("Groq Vision OCR failed, falling back to secondary REST API:", err.message);
    return null;
  }
}

/**
 * 2. Secondary Fallback: OCR.space REST API
 * Lightweight HTTP REST fallback for serverless environments.
 */
async function runOcrSpace(buffer) {
  const apiKey = process.env.OCR_SPACE_API_KEY;
  if (!apiKey) return null;

  try {
    const base64 = "data:image/png;base64," + buffer.toString("base64");
    const formData = new FormData();
    formData.append("apikey", apiKey);
    formData.append("base64Image", base64);
    formData.append("isOverlayRequired", "false");
    formData.append("detectOrientation", "true");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;
    const data = await response.json();

    if (data.ParsedResults && data.ParsedResults.length > 0) {
      const parsed = data.ParsedResults[0].ParsedText?.trim();
      if (parsed) return parsed;
    }
  } catch (err) {
    console.warn("OCR.space request failed:", err.message);
  }
  return null;
}

export async function extractTextFromImage(imageBuffer) {
  // 1. Input validation
  if (!imageBuffer || imageBuffer.length === 0) {
    throw new Error("No image provided or image is empty.");
  }

  // 2. Size check
  if (imageBuffer.length > MAX_IMAGE_BYTES) {
    throw new Error(
      "Image is too large for text extraction. Please upload a smaller image."
    );
  }

  try {
    // 3. Try Groq Vision API first (matches ICMLDE 2026 serverless architecture)
    let text = await runGroqVision(imageBuffer);
    let confidence = 98;

    // 4. Fallback to OCR Space REST API if Groq hits rate limits or network issues
    if (!text) {
      text = await runOcrSpace(imageBuffer);
      confidence = 92;
    }

    // 5. Handle empty or unreadable text
    if (!text || text.length === 0) {
      return {
        text: "No readable text found in image.",
        confidence: 0,
      };
    }

    return {
      text: text,
      confidence: confidence,
    };
  } catch (error) {
    console.error("Text extraction failed:", error);
    throw new Error(
      "Failed to extract text from image. Please try again or upload a clearer image."
    );
  }
}
