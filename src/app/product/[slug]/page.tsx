import React from "react";
import { notFound } from "next/navigation";
import { MOCK_PRODUCTS } from "@/data/mock-products";
import { ProductView } from "@/components/product/ProductView";
import { ProductCard } from "@/components/product/ProductCard";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return MOCK_PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug || p.id === slug);

  if (!product) {
    return {
      title: "Товар не найден — BUTELLA",
    };
  }

  return {
    title: `${product.title} — Бутик BUTELLA Кызылорда`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.title} — BUTELLA`,
      description: product.description,
      images: product.images[0]?.imageUrl ? [product.images[0].imageUrl] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug || p.id === slug);

  if (!product) {
    notFound();
  }

  // Related products from same category or featured
  const relatedProducts = MOCK_PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.isFeatured)
  ).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <ProductView product={product} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 pt-16 border-t border-[#E6DCD1]">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#A0826C] font-semibold block mb-1">
              Обратите внимание
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#141414]">
              Вам также может понравиться
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
