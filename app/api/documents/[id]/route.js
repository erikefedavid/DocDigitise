import connectDB from "@/lib/db";
import Document from "@/models/Document";
import { verifyToken } from "@/lib/auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { NextResponse } from "next/server";


export async function GET(request, { params }) {
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

    const { id } = await params;

    console.log("Looking for document with ID:", id);

    await connectDB();

    const document = await Document.findOne({
      _id: id,
      userId: decoded.userId,
    });

    console.log("Document found:", !!document);

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { document },
    });
  } catch (error) {
    console.error("Fetch document error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}
export async function DELETE(request, { params }) {
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

    const { id } = await params;

    console.log("Deleting document with ID:", id);

    await connectDB();

    const document = await Document.findOne({
      _id: id,
      userId: decoded.userId,
    });

    console.log("Document found:", !!document);

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    if (document.cloudinaryId) {
      await deleteFromCloudinary(document.cloudinaryId);
    }

    await Document.findByIdAndDelete(id);

    console.log("Document deleted successfully");

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
