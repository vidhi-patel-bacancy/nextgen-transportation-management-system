import { NextResponse } from "next/server";

import { uploadFile } from "@/lib/s3/s3Client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadFile({
      buffer,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
    });

    return NextResponse.json(uploaded, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
