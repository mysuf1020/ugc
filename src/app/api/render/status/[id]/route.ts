import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const exportRecord = await prisma.videoExport.findUnique({
      where: { id },
    });

    if (!exportRecord) {
      return NextResponse.json({ error: "Export job not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: exportRecord.id,
      status: exportRecord.status, // PROCESSING, COMPLETED, FAILED
      progress: exportRecord.progress,
      outputPath: exportRecord.outputPath,
      errorMessage: exportRecord.errorMessage,
      fileSize: exportRecord.fileSize,
    });
  } catch (error) {
    console.error("Failed to check render status:", error);
    return NextResponse.json({ error: "Failed to check render status" }, { status: 500 });
  }
}
