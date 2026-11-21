import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Разрешены только фотографии (JPEG, PNG, WEBP)" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      // Save locally to public/uploads
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });

      const ext = file.name.split(".").pop() || "jpg";
      const cleanName = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const filePath = path.join(uploadsDir, cleanName);

      await fs.writeFile(filePath, buffer);

      return NextResponse.json({ url: `/uploads/${cleanName}` });
    } catch (fsErr) {
      // In serverless / read-only filesystems, fallback to data URL
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
      return NextResponse.json({ url: base64 });
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Не удалось сохранить фотографию" },
      { status: 500 }
    );
  }
}
