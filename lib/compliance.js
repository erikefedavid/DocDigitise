import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const PRIMARY_MODEL = "qwen/qwen3.8-27b";
const FALLBACK_MODEL = "openai/gpt-oss-120b";

/**
 * Autonomously inspects document text and verifies institutional clearance & compliance rules
 * @param {string} text Extracted document text
 * @returns {Promise<Object>} Structured clearance audit result
 */
export async function auditClearanceDocument(text) {
  if (!text || text.trim().length === 0) {
    return {
      overallStatus: "NOT_CLEARANCE_DOCUMENT",
      summary: "No document text available to audit.",
      student: {},
      financialAudit: { isCleared: false },
      departmentalSignoffs: [],
    };
  }

  const trimmedText = text.length > 15000 ? text.substring(0, 15000) + "..." : text;

  const systemPrompt = `You are an Autonomous Institutional Audit Agent for university records and clearance dockets.
Rigorously inspect the provided document text and produce a verified compliance audit.

JSON SCHEMA REQUIREMENT:
{
  "documentType": "clearance_form" | "transcript" | "financial_receipt" | "other",
  "student": {
    "fullName": string or null,
    "matricNumber": string or null,
    "department": string or null,
    "session": string or null
  },
  "financialAudit": {
    "isCleared": boolean,
    "outstandingBalance": number,
    "currency": string,
    "notes": string
  },
  "departmentalSignoffs": [
    {
      "department": "Library" | "Bursary" | "Department/HOD" | "Sports" | "StudentAffairs",
      "signoffPresent": boolean,
      "evidenceText": string
    }
  ],
  "overallStatus": "APPROVED" | "FLAGGED_DEFICIENCY" | "NOT_CLEARANCE_DOCUMENT",
  "deficiencyReasons": string[],
  "summary": string
}

RULES:
1. If the document is not an academic clearance or transcript, set documentType to "other" and overallStatus to "NOT_CLEARANCE_DOCUMENT".
2. If it is a clearance form:
   - Check if any department approval or stamp is missing.
   - Check if outstanding balance is greater than 0.
   - If any fee is unpaid OR any required signature is missing, set overallStatus to "FLAGGED_DEFICIENCY" and list the specific reasons.
   - If all requirements are confirmed satisfied, set overallStatus to "APPROVED".
3. Output strictly valid JSON. Do not include markdown codeblocks or conversational text.`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `DOCUMENT TO AUDIT:\n\n${trimmedText}` },
  ];

  let response;
  try {
    response = await client.chat.completions.create({
      model: PRIMARY_MODEL,
      messages,
      temperature: 0.1,
      response_format: { type: "json_object" },
    });
  } catch (err) {
    console.warn("Compliance primary model failed, trying fallback:", err.message);
    response = await client.chat.completions.create({
      model: FALLBACK_MODEL,
      messages,
      temperature: 0.1,
      response_format: { type: "json_object" },
    });
  }

  try {
    const content = response.choices?.[0]?.message?.content || "{}";
    return JSON.parse(content);
  } catch (parseError) {
    console.error("Failed to parse compliance audit JSON:", parseError);
    return {
      overallStatus: "FLAGGED_DEFICIENCY",
      summary: "Audit completed with formatting errors. Manual review advised.",
      student: {},
      financialAudit: { isCleared: false },
      departmentalSignoffs: [],
      deficiencyReasons: ["Automated parser error; manual inspection required."],
    };
  }
}
