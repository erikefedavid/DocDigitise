import connectDB from "@/lib/db";
import Document from "@/models/Document";
import { verifyToken } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const PRIMARY_MODEL = "qwen/qwen3.8-27b";
const FALLBACK_MODEL = "openai/gpt-oss-120b";

export async function POST(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const { allowed } = checkRateLimit(`flash_${decoded.userId}`, 5, 60000);

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait." },
        { status: 429 }
      );
    }

    const { id } = await params;

    await connectDB();

    const document = await Document.findOne({
      _id: id,
      userId: decoded.userId,
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    const trimmedText =
      document.extractedText.length > 10000
        ? document.extractedText.substring(0, 10000)
        : document.extractedText;

    const messages = [
      {
        role: "system",
        content: `You are an academic assistant. Generate exactly 5 flashcards from the provided text. Each flashcard should have a question on the front and an answer on the back. Return ONLY a valid JSON array in this exact format with no conversational preamble or markdown code fences:
[
  {"front": "Question here?", "back": "Answer here."},
  {"front": "Question here?", "back": "Answer here."}
]`,
      },
      {
        role: "user",
        content: `Generate flashcards from this text:\n\n${trimmedText}`,
      },
    ];

    let response;
    try {
      response = await client.chat.completions.create({
        model: PRIMARY_MODEL,
        messages,
        max_tokens: 1200,
        temperature: 0.3,
      });
    } catch (primaryError) {
      console.warn("Primary model flashcards failed, trying fallback:", primaryError.message);
      response = await client.chat.completions.create({
        model: FALLBACK_MODEL,
        messages,
        max_tokens: 2500,
        temperature: 0.3,
      });
    }

    const content = response.choices?.[0]?.message?.content || "";

    let flashcards = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        flashcards = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("JSON parse failed for flashcards:", parseError.message, content);
      flashcards = [
        {
          front: "What is the key takeaway of this document?",
          back: document.summary ? document.summary.substring(0, 200) + "..." : "Review the extracted text for key takeaways.",
        },
      ];
    }

    return NextResponse.json({
      success: true,
      data: { flashcards },
    });
  } catch (error) {
    console.error("Flashcard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}