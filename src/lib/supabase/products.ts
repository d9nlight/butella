import fs from "fs/promises";
import path from "path";
import { Product } from "@/types/ecommerce";
import productsJson from "@/data/products.json";

function getProductsFilePath(): string {
  return path.join(process.cwd(), "src", "data", "products.json");
}

/**
 * Loads products from the local JSON file.
 */
export async function getLocalProducts(): Promise<Product[]> {
  try {
    const filePath = getProductsFilePath();
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as Product[];
  } catch {
    return productsJson as Product[];
  }
}

/**
 * Saves products to the local JSON file.
 */
export async function saveLocalProducts(products: Product[]): Promise<void> {
  const filePath = getProductsFilePath();
  await fs.writeFile(filePath, JSON.stringify(products, null, 2), "utf-8");
}

export async function getProducts(options?: {
  category?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
}): Promise<Product[]> {
  let list = await getLocalProducts();

  list = list.filter((p) => p.isActive);

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

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const list = await getLocalProducts();
  return list.find((p) => p.slug === slug || p.id === slug) || null;
}
