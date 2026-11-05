import { cacheLife } from "next/cache";
import { Product, ProductImage, ProductVariant } from "@/types/ecommerce";
import { MOCK_PRODUCTS } from "@/data/mock-products";
import { isSupabaseConfigured, getAdminClient } from "./admin";

export async function getProducts(options?: {
  category?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
}): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  if (!isSupabaseConfigured()) {
    let list = [...MOCK_PRODUCTS];
    if (options?.category && options.category !== "Все") {
      list = list.filter((p) => p.category === options.category);
    }
    if (options?.isFeatured) {
      list = list.filter((p) => p.isFeatured);
    }
    if (options?.isNewArrival) {
      list = list.filter((p) => p.isNewArrival);
    }
    return list;
  }

  try {
    const supabase = getAdminClient();
    let query = supabase
      .from("products")
      .select(`
        *,
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (options?.category && options.category !== "Все") {
      query = query.eq("category", options.category);
    }
    if (options?.isFeatured) {
      query = query.eq("is_featured", true);
    }
    if (options?.isNewArrival) {
      query = query.eq("is_new_arrival", true);
    }

    const { data, error } = await query;
    if (error || !data) {
      console.warn("Supabase query error, falling back to mock data:", error?.message);
      return MOCK_PRODUCTS;
    }

    return data.map(mapDatabaseProductToDomain);
  } catch (err) {
    console.warn("Failed to connect to Supabase, using mock products:", err);
    return MOCK_PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("minutes");
  if (!isSupabaseConfigured()) {
    return MOCK_PRODUCTS.find((p) => p.slug === slug || p.id === slug) || null;
  }

  try {
    const supabase = getAdminClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    let query = supabase
      .from("products")
      .select(`
        *,
        images:product_images(*),
        variants:product_variants(*)
      `);

    if (isUuid) {
      query = query.or(`slug.eq.${slug},id.eq.${slug}`);
    } else {
      query = query.eq("slug", slug);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      // Fallback check in mock products or by title
      const mock = MOCK_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
      if (mock) {
        const { data: byTitle } = await supabase
          .from("products")
          .select(`
            *,
            images:product_images(*),
            variants:product_variants(*)
          `)
          .ilike("title", `%${mock.title}%`)
          .maybeSingle();

        if (byTitle) return mapDatabaseProductToDomain(byTitle);
      }
      return mock || null;
    }

    return mapDatabaseProductToDomain(data);
  } catch (err) {
    return MOCK_PRODUCTS.find((p) => p.slug === slug || p.id === slug) || null;
  }
}

function mapDatabaseProductToDomain(row: any): Product {
  const rawImages = row.images || [];
  const rawVariants = row.variants || [];

  const images: ProductImage[] = rawImages
    .sort((a: any, b: any) => a.display_order - b.display_order)
    .map((img: any) => ({
      id: img.id,
      productId: img.product_id,
      imageUrl: img.image_url,
      displayOrder: img.display_order,
      isPrimary: img.is_primary,
    }));

  const variants: ProductVariant[] = rawVariants.map((v: any) => ({
    id: v.id,
    productId: v.product_id,
    size: v.size,
    color: v.color,
    sku: v.sku || undefined,
    stockQuantity: v.stock_quantity,
  }));

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description || "",
    category: row.category,
    basePrice: row.base_price,
    isActive: row.is_active,
    isFeatured: row.is_featured,
    isNewArrival: row.is_new_arrival,
    images: images.length > 0 ? images : [
      { id: "fallback", productId: row.id, imageUrl: "", displayOrder: 1, isPrimary: true }
    ],
    variants,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
