import { Product } from "@/types/ecommerce";
import productsData from "./products.json";

export const CATEGORIES = [
  "Все",
  "Платья",
  "Костюмы",
  "Верхняя одежда",
  "Блузы и топы",
  "Юбки и брюки",
] as const;

export const SIZES = ["XS", "S", "M", "L", "XL"] as const;

export const MOCK_PRODUCTS: Product[] = productsData as Product[];
