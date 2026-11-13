import connectDB from "@/lib/db";
import Document from "@/models/Document";
import { verifyToken } from "@/lib/auth";
import { auditClearanceDocument } from "@/lib/compliance";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const document = await Document.findOne({
      _id: id,
      userId: decoded.userId,
    });

    if (!document) {
      return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 });
    }

    // If already audited, return the cached audit report
    if (document.auditReport) {
      return NextResponse.json({ success: true, data: { audit: document.auditReport } });
    }

    // Otherwise, generate the audit report dynamically
    const audit = await auditClearanceDocument(document.extractedText);

    // Save report to document
    document.auditReport = audit;
    await document.save();

    return NextResponse.json({ success: true, data: { audit } });
  } catch (error) {
    console.error("Compliance audit error:", error);
    return NextResponse.json({ success: false, error: "Failed to audit document" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  // Re-run the audit on demand
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const document = await Document.findOne({
      _id: id,
      userId: decoded.userId,
    });

    if (!document) {
      return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 });
    }

    const audit = await auditClearanceDocument(document.extractedText);
    document.auditReport = audit;
    await document.save();

    return NextResponse.json({ success: true, data: { audit } });
  } catch (error) {
    console.error("Re-audit error:", error);
    return NextResponse.json({ success: false, error: "Failed to re-audit document" }, { status: 500 });
  }
}
