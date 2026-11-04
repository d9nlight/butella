import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured, getAdminClient } from "@/lib/supabase/admin";
import { MOCK_PRODUCTS } from "@/data/mock-products";
import { Product } from "@/types/ecommerce";

// In-memory working copy for when Supabase is not yet connected
let localProducts = [...MOCK_PRODUCTS];

export async function GET() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ products: localProducts });
  }

  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        images:product_images(*),
        variants:product_variants(*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ products: localProducts });
    }

    const mapped = data.map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description || "",
      category: row.category,
      basePrice: row.base_price,
      isActive: row.is_active,
      isFeatured: row.is_featured,
      isNewArrival: row.is_new_arrival,
      images: (row.images || []).sort((a: any, b: any) => a.display_order - b.display_order).map((img: any) => ({
        id: img.id,
        productId: img.product_id,
        imageUrl: img.image_url,
        displayOrder: img.display_order,
        isPrimary: img.is_primary,
      })),
      variants: (row.variants || []).map((v: any) => ({
        id: v.id,
        productId: v.product_id,
        size: v.size,
        color: v.color,
        sku: v.sku,
        stockQuantity: v.stock_quantity,
      })),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ products: mapped });
  } catch {
    return NextResponse.json({ products: localProducts });
  }
}

export async function POST(req: NextRequest) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      id,
      title,
      description,
      category,
      basePrice,
      isActive,
      isFeatured,
      isNewArrival,
      images,
      variants,
    } = body;

    if (!title || !category || basePrice === undefined) {
      return NextResponse.json(
        { error: "Заполните обязательные поля: название, категория и цена" },
        { status: 400 }
      );
    }

    const slug =
      body.slug ||
      title
        .toLowerCase()
        .replace(/[^a-zа-я0-9\s-]/gi, "")
        .trim()
        .replace(/\s+/g, "-") + `-${Date.now().toString().slice(-4)}`;

    if (isSupabaseConfigured()) {
      const supabase = getAdminClient() as any;

      if (id) {
        // UPDATE EXISTING PRODUCT
        const { error: prodErr } = await supabase
          .from("products")
          .update({
            title,
            description: description || "",
            category,
            base_price: Number(basePrice),
            is_active: Boolean(isActive),
            is_featured: Boolean(isFeatured),
            is_new_arrival: Boolean(isNewArrival),
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (prodErr) throw prodErr;

        // Replace images
        if (images && images.length > 0) {
          await supabase.from("product_images").delete().eq("product_id", id);
          const imageInserts = images.map((img: any, idx: number) => ({
            product_id: id,
            image_url: img.imageUrl,
            display_order: idx + 1,
            is_primary: idx === 0,
          }));
          await supabase.from("product_images").insert(imageInserts);
        }

        // Replace variants
        if (variants && variants.length > 0) {
          await supabase.from("product_variants").delete().eq("product_id", id);
          const variantInserts = variants.map((v: any) => ({
            product_id: id,
            size: v.size,
            color: v.color || "Основной",
            sku: v.sku || null,
            stock_quantity: Number(v.stockQuantity) || 0,
          }));
          await supabase.from("product_variants").insert(variantInserts);
        }

        return NextResponse.json({ success: true, id });
      } else {
        // CREATE NEW PRODUCT
        const { data: newProd, error: prodErr } = await supabase
          .from("products")
          .insert({
            title,
            slug,
            description: description || "",
            category,
            base_price: Number(basePrice),
            is_active: isActive !== undefined ? Boolean(isActive) : true,
            is_featured: Boolean(isFeatured),
            is_new_arrival: Boolean(isNewArrival),
          })
          .select("id")
          .single();

        if (prodErr || !newProd) throw prodErr;

        const newId = newProd.id;

        // Insert images
        if (images && images.length > 0) {
          const imageInserts = images.map((img: any, idx: number) => ({
            product_id: newId,
            image_url: img.imageUrl,
            display_order: idx + 1,
            is_primary: idx === 0,
          }));
          await supabase.from("product_images").insert(imageInserts);
        }

        // Insert variants
        if (variants && variants.length > 0) {
          const variantInserts = variants.map((v: any) => ({
            product_id: newId,
            size: v.size,
            color: v.color || "Основной",
            sku: v.sku || null,
            stock_quantity: Number(v.stockQuantity) || 0,
          }));
          await supabase.from("product_variants").insert(variantInserts);
        }

        return NextResponse.json({ success: true, id: newId });
      }
    } else {
      // Local fallback in-memory state
      if (id) {
        localProducts = localProducts.map((p) =>
          p.id === id
            ? {
                ...p,
                title,
                description: description || "",
                category,
                basePrice: Number(basePrice),
                isActive: Boolean(isActive),
                isFeatured: Boolean(isFeatured),
                isNewArrival: Boolean(isNewArrival),
                images: images || p.images,
                variants: variants || p.variants,
                updatedAt: new Date().toISOString(),
              }
            : p
        );
      } else {
        const newProduct: Product = {
          id: `prod-${Date.now()}`,
          title,
          slug,
          description: description || "",
          category,
          basePrice: Number(basePrice),
          isActive: isActive !== undefined ? Boolean(isActive) : true,
          isFeatured: Boolean(isFeatured),
          isNewArrival: Boolean(isNewArrival),
          images:
            images && images.length > 0
              ? images.map((img: any, idx: number) => ({
                  id: `img-${Date.now()}-${idx}`,
                  productId: `prod-${Date.now()}`,
                  imageUrl: img.imageUrl,
                  displayOrder: idx + 1,
                  isPrimary: idx === 0,
                }))
              : [
                  {
                    id: `img-default`,
                    productId: `prod-${Date.now()}`,
                    imageUrl:
                      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80",
                    displayOrder: 1,
                    isPrimary: true,
                  },
                ],
          variants:
            variants && variants.length > 0
              ? variants.map((v: any, idx: number) => ({
                  id: `var-${Date.now()}-${idx}`,
                  productId: `prod-${Date.now()}`,
                  size: v.size,
                  color: v.color || "Основной",
                  stockQuantity: Number(v.stockQuantity) || 0,
                }))
              : [
                  {
                    id: `var-${Date.now()}-s`,
                    productId: `prod-${Date.now()}`,
                    size: "S",
                    color: "Основной",
                    stockQuantity: 5,
                  },
                ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        localProducts.unshift(newProduct);
      }

      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    console.error("Save product error:", error);
    return NextResponse.json(
      { error: error?.message || "Ошибка при сохранении товара" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID товара не указан" }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = getAdminClient();
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  } else {
    localProducts = localProducts.filter((p) => p.id !== id);
    return NextResponse.json({ success: true });
  }
}
