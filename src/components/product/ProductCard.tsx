"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/ecommerce";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Eye } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCart();

  const primaryImage =
    product.images.find((img) => img.isPrimary) || product.images[0];
  const secondaryImage =
    product.images.find((img) => !img.isPrimary) || primaryImage;

  // Available unique sizes
  const sizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Find first variant in stock
    const availableVariant = product.variants.find((v) => v.stockQuantity > 0);
    if (!availableVariant) return;

    addItem({
      productId: product.id,
      variantId: availableVariant.id,
      title: product.title,
      slug: product.slug,
      price: product.basePrice,
      size: availableVariant.size,
      color: availableVariant.color,
      image: primaryImage.imageUrl,
      quantity: 1,
      maxStock: availableVariant.stockQuantity,
    });
  };

  return (
    <div
      className="group flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-3/4 w-full overflow-hidden bg-[#F4EFEA] block rounded-xs"
      >
        {/* Primary Image */}
        <Image
          src={primaryImage.imageUrl}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover object-center transition-all duration-700 ease-out ${
            isHovered && secondaryImage ? "opacity-0 scale-105" : "opacity-100 scale-100"
          }`}
        />

        {/* Secondary Image (on hover) */}
        {secondaryImage && (
          <Image
            src={secondaryImage.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover object-center transition-all duration-700 ease-out absolute inset-0 ${
              isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
            }`}
          />
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isNewArrival && (
            <span className="bg-[#141414] text-[#FAF8F5] text-[10px] tracking-widest uppercase px-2 py-1 font-medium shadow-xs">
              Новинка
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-[#C5A059] text-black text-[10px] tracking-widest uppercase px-2 py-1 font-semibold shadow-xs">
              Хит
            </span>
          )}
          {totalStock === 0 && (
            <span className="bg-neutral-800/90 text-white text-[10px] tracking-widest uppercase px-2 py-1 font-medium">
              Распродано
            </span>
          )}
        </div>

        {/* Quick Add Overlay on Desktop */}
        {totalStock > 0 && (
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex justify-center">
            <button
              onClick={handleQuickAdd}
              className="w-full bg-[#FDFBF7] text-[#141414] text-[11px] uppercase tracking-widest py-2.5 font-medium hover:bg-[#C5A059] hover:text-black transition-colors flex items-center justify-center gap-1.5 shadow-md"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>В корзину</span>
            </button>
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="pt-3 pb-2 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-1">
            {product.category}
          </div>

          {/* Title */}
          <Link
            href={`/product/${product.slug}`}
            className="font-serif text-sm sm:text-base text-[#141414] hover:text-[#A0826C] transition-colors line-clamp-1 block"
          >
            {product.title}
          </Link>
        </div>

        <div className="mt-2 pt-2 border-t border-[#E6DCD1]/50 flex items-center justify-between">
          {/* Price */}
          <div className="text-sm sm:text-base font-semibold text-[#141414]">
            {formatPrice(product.basePrice)}
          </div>

          {/* Size Pills */}
          <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-light">
            {sizes.slice(0, 3).map((sz) => (
              <span key={sz} className="uppercase">
                {sz}
              </span>
            ))}
            {sizes.length > 3 && <span>+{sizes.length - 3}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
