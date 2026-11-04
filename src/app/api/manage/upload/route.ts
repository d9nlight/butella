import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured, getAdminClient } from "@/lib/supabase/admin";

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

    // Check file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Разрешены только фотографии (JPEG, PNG, WEBP)" },
        { status: 400 }
      );
    }

    // If Supabase is configured, upload to "products" storage bucket
    if (isSupabaseConfigured()) {
      const supabase = getAdminClient();
      const ext = file.name.split(".").pop() || "jpg";
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `catalog/${filename}`;

      const buffer = Buffer.from(await file.arrayBuffer());

      const { data, error } = await supabase.storage
        .from("products")
        .upload(path, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        console.error("Supabase storage upload error:", error);
        return NextResponse.json(
          { error: `Ошибка загрузки в облако: ${error.message}` },
          { status: 500 }
        );
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(path);

      return NextResponse.json({ url: publicUrl });
    } else {
      // Local development mock: convert small images to data URL or return high-res placeholder
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
      return NextResponse.json({ url: base64 });
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Не удалось загрузить изображение" },
      { status: 500 }
    );
  }
}
