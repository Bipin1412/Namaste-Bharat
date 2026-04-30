import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "business-images");

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

function getFileExtension(file: File): string {
  if (file.type in MIME_TO_EXTENSION) {
    return MIME_TO_EXTENSION[file.type];
  }

  const extension = path.extname(file.name).toLowerCase();
  if (extension) {
    return extension;
  }

  return ".jpg";
}

export async function POST(request: NextRequest) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: { message: "Request body must be multipart/form-data." } },
      { status: 400 }
    );
  }

  const files = formData.getAll("images").filter((entry): entry is File => entry instanceof File);

  if (files.length === 0) {
    return NextResponse.json(
      { error: { message: "At least one image is required." } },
      { status: 400 }
    );
  }

  if (files.length > MAX_IMAGES) {
    return NextResponse.json(
      { error: { message: `You can upload up to ${MAX_IMAGES} images at once.` } },
      { status: 400 }
    );
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const uploaded: Array<{ url: string; name: string; size: number }> = [];
  const writtenPaths: string[] = [];

  try {
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: { message: `${file.name} is not a valid image file.` } },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: { message: `${file.name} is larger than 5 MB.` } },
          { status: 400 }
        );
      }

      const extension = getFileExtension(file);
      const fileName = `${Date.now()}-${randomUUID()}${extension}`;
      const targetPath = path.join(UPLOAD_DIR, fileName);
      const bytes = Buffer.from(await file.arrayBuffer());

      await writeFile(targetPath, bytes);
      writtenPaths.push(targetPath);

      uploaded.push({
        url: `/uploads/business-images/${fileName}`,
        name: file.name,
        size: file.size,
      });
    }
  } catch {
    await Promise.all(
      writtenPaths.map((filePath) => unlink(filePath).catch(() => undefined))
    );
    return NextResponse.json(
      { error: { message: "Could not save uploaded images." } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: uploaded }, { status: 201 });
}
