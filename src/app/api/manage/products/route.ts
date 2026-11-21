import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getLocalProducts, saveLocalProducts } from "@/lib/supabase/products";
import { Product } from "@/types/ecommerce";

export async function GET() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 401 });
  }

  const products = await getLocalProducts();
  return NextResponse.json({ products });
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

    const products = await getLocalProducts();

    if (id) {
      // Update existing
      const updatedList = products.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            title,
            slug: p.slug || slug,
            description: description || "",
            category,
            basePrice: Number(basePrice),
            isActive: Boolean(isActive),
            isFeatured: Boolean(isFeatured),
            isNewArrival: Boolean(isNewArrival),
            images: images && images.length > 0 ? images.map((img: any, idx: number) => ({
              id: img.id || `img-${id}-${idx}`,
              productId: id,
              imageUrl: img.imageUrl,
              displayOrder: idx + 1,
              isPrimary: idx === 0,
            })) : p.images,
            variants: variants && variants.length > 0 ? variants.map((v: any, idx: number) => ({
              id: v.id || `var-${id}-${idx}`,
              productId: id,
              size: v.size,
              color: v.color || "Основной",
              stockQuantity: Number(v.stockQuantity) || 0,
            })) : p.variants,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });

      await saveLocalProducts(updatedList);
      return NextResponse.json({ success: true, id });
    } else {
      // Create new product
      const newId = `prod-${Date.now()}`;
      const newProduct: Product = {
        id: newId,
        title,
        slug,
        description: description || "",
        category,
        basePrice: Number(basePrice),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        isFeatured: Boolean(isFeatured),
        isNewArrival: Boolean(isNewArrival),
        images: images && images.length > 0
          ? images.map((img: any, idx: number) => ({
              id: `img-${Date.now()}-${idx}`,
              productId: newId,
              imageUrl: img.imageUrl,
              displayOrder: idx + 1,
              isPrimary: idx === 0,
            }))
          : [
              {
                id: `img-${Date.now()}-1`,
                productId: newId,
                imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80",
                displayOrder: 1,
                isPrimary: true,
              },
            ],
        variants: variants && variants.length > 0
          ? variants.map((v: any, idx: number) => ({
              id: `var-${Date.now()}-${idx}`,
              productId: newId,
              size: v.size,
              color: v.color || "Основной",
              stockQuantity: Number(v.stockQuantity) || 0,
            }))
          : [
              {
                id: `var-${Date.now()}-s`,
                productId: newId,
                size: "S",
                color: "Основной",
                stockQuantity: 3,
              },
            ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      products.unshift(newProduct);
      await saveLocalProducts(products);
      return NextResponse.json({ success: true, id: newId });
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

  const products = await getLocalProducts();
  const updatedList = products.filter((p) => p.id !== id);
  await saveLocalProducts(updatedList);

  return NextResponse.json({ success: true });
}
