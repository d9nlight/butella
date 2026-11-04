"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductVariant } from "@/types/ecommerce";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  Heart,
  Share2,
  Truck,
  CreditCard,
  MapPin,
  ChevronDown,
  Check,
  AlertCircle,
  Phone,
} from "lucide-react";

interface ProductViewProps {
  product: Product;
}

export function ProductView({ product }: ProductViewProps) {
  const { addItem } = useCart();

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Group variants by size and color
  const availableVariants = product.variants;
  const initialVariant =
    availableVariants.find((v) => v.stockQuantity > 0) || availableVariants[0];

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(initialVariant);
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>("delivery");

  const images = product.images.length > 0 ? product.images : [
    { id: "fallback", productId: product.id, imageUrl: "", displayOrder: 1, isPrimary: true }
  ];

  const isOutOfStock = !selectedVariant || selectedVariant.stockQuantity <= 0;

  const handleAddToCart = () => {
    if (!selectedVariant || isOutOfStock) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      title: product.title,
      slug: product.slug,
      price: product.basePrice,
      size: selectedVariant.size,
      color: selectedVariant.color,
      image: images[activeImageIndex]?.imageUrl || images[0]?.imageUrl,
      quantity,
      maxStock: selectedVariant.stockQuantity,
    });
  };

  const toggleAccordion = (key: string) => {
    setActiveAccordion(activeAccordion === key ? null : key);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
      {/* LEFT: Image Gallery (thumbnails + main view) */}
      <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto shrink-0 sm:w-20">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-16 h-20 sm:w-20 sm:h-26 shrink-0 overflow-hidden rounded-xs border-2 transition-all ${
                  activeImageIndex === idx
                    ? "border-[#141414] opacity-100"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.imageUrl}
                  alt={`${product.title} ракурс ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover object-center"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main Display Image */}
        <div className="relative flex-1 aspect-3/4 bg-[#FAF8F5] rounded-xs overflow-hidden border border-[#E6DCD1]">
          {images[activeImageIndex] && (
            <Image
              src={images[activeImageIndex].imageUrl}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-center"
            />
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isNewArrival && (
              <span className="bg-[#141414] text-white text-[10px] tracking-widest uppercase px-2.5 py-1 font-medium">
                Новинка
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-[#C5A059] text-black text-[10px] tracking-widest uppercase px-2.5 py-1 font-semibold">
                Хит продаж
              </span>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Product Information & Purchase Options */}
      <div className="lg:col-span-5 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Breadcrumb / Category */}
          <div className="text-xs uppercase tracking-[0.2em] text-[#A0826C] font-semibold">
            <Link href="/catalog" className="hover:underline">Каталог</Link>
            <span className="mx-2">•</span>
            <Link href={`/catalog?cat=${encodeURIComponent(product.category)}`} className="hover:underline">
              {product.category}
            </Link>
          </div>

          {/* Product Title */}
          <h1 className="font-serif text-3xl sm:text-4xl text-[#141414] leading-tight">
            {product.title}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-semibold text-[#141414]">
              {formatPrice(product.basePrice)}
            </span>
            <span className="text-xs text-neutral-400 font-light">
              Включая все налоги
            </span>
          </div>

          <hr className="border-[#E6DCD1]" />

          {/* Color Selection */}
          <div>
            <div className="flex justify-between items-center text-xs mb-2.5">
              <span className="text-neutral-500 uppercase tracking-wider font-light">
                Цвет:
              </span>
              <span className="font-medium text-neutral-900">
                {selectedVariant?.color || "Не выбран"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {Array.from(new Set(product.variants.map((v) => v.color))).map((cName) => {
                const variantForColor = product.variants.find((v) => v.color === cName);
                const isSelected = selectedVariant?.color === cName;
                return (
                  <button
                    key={cName}
                    onClick={() => {
                      if (variantForColor) setSelectedVariant(variantForColor);
                    }}
                    className={`px-3.5 py-1.5 text-xs rounded-xs border transition-all ${
                      isSelected
                        ? "border-[#141414] bg-[#141414] text-white"
                        : "border-[#E6DCD1] bg-[#FAF8F5] text-neutral-700 hover:border-black"
                    }`}
                  >
                    {cName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <div className="flex justify-between items-center text-xs mb-2.5">
              <span className="text-neutral-500 uppercase tracking-wider font-light">
                Размер:
              </span>
              <a
                href="https://wa.me/77771234567?text=Здравствуйте,%20подскажите%20пожалуйста%20по%20размеру%20для%20модели:%20"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#A0826C] hover:underline"
              >
                Помощь с размером (WhatsApp)
              </a>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                const outOfStock = v.stockQuantity <= 0;
                return (
                  <button
                    key={v.id}
                    disabled={outOfStock}
                    onClick={() => {
                      setSelectedVariant(v);
                      setQuantity(1);
                    }}
                    className={`py-3 text-xs font-medium border text-center transition-all ${
                      isSelected
                        ? "border-[#141414] bg-[#141414] text-white shadow-xs"
                        : outOfStock
                        ? "border-neutral-200 bg-neutral-100/60 text-neutral-400 line-through cursor-not-allowed"
                        : "border-[#E6DCD1] bg-[#FAF8F5] text-neutral-800 hover:border-black"
                    }`}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock availability indicator */}
          <div className="text-xs">
            {isOutOfStock ? (
              <div className="flex items-center gap-1.5 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>Выбранный размер временно закончился</span>
              </div>
            ) : selectedVariant.stockQuantity <= 3 ? (
              <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Осталось всего {selectedVariant.stockQuantity} шт. в бутике (Кызылорда)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-700">
                <Check className="w-4 h-4 stroke-[2]" />
                <span>В наличии в бутике (Кызылорда, ул. Абая 45)</span>
              </div>
            )}
          </div>

          {/* Action Buttons: Add to cart & WhatsApp Fast Order */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full bg-[#141414] text-white py-4 px-6 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#C5A059] hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isOutOfStock ? "Нет в наличии" : "Добавить в корзину"}</span>
            </button>

            <a
              href={`https://wa.me/77771234567?text=${encodeURIComponent(
                `Здравствуйте! Хочу заказать или примерить в бутике: ${product.title} (Размер: ${selectedVariant?.size || "не выбран"})`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full border border-neutral-300 bg-white py-3 px-6 text-xs uppercase tracking-wider font-medium text-neutral-800 hover:border-black hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Заказать через WhatsApp / Kaspi</span>
            </a>
          </div>

          {/* Description */}
          <div className="pt-4 text-xs text-neutral-600 font-light leading-relaxed">
            <p>{product.description}</p>
          </div>

          {/* Accordion: Delivery, Kaspi Payment, Boutique fitting */}
          <div className="border-t border-[#E6DCD1] divide-y divide-[#E6DCD1] pt-2">
            {/* Delivery option */}
            <div>
              <button
                onClick={() => toggleAccordion("delivery")}
                className="w-full py-3 flex justify-between items-center text-xs uppercase tracking-wider font-medium text-neutral-800 text-left"
              >
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#A0826C]" />
                  <span>Доставка и примерка</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeAccordion === "delivery" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeAccordion === "delivery" && (
                <div className="pb-4 text-xs text-neutral-600 font-light space-y-1.5 leading-relaxed">
                  <p>• <strong>Самовывоз в Кызылорде</strong> (ул. Абая 45) — бесплатно, с возможностью примерки.</p>
                  <p>• <strong>Курьер по Кызылорде</strong> — день в день, стоимость 1 500 ₸.</p>
                  <p>• <strong>Доставка по Казахстану</strong> (Казпочта / CDEK) — 2 500 ₸ (2-4 дня).</p>
                </div>
              )}
            </div>

            {/* Payment option */}
            <div>
              <button
                onClick={() => toggleAccordion("payment")}
                className="w-full py-3 flex justify-between items-center text-xs uppercase tracking-wider font-medium text-neutral-800 text-left"
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#A0826C]" />
                  <span>Оплата через Kaspi</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeAccordion === "payment" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeAccordion === "payment" && (
                <div className="pb-4 text-xs text-neutral-600 font-light space-y-1.5 leading-relaxed">
                  <p>Принимаем оплату через <strong>Kaspi Pay, Kaspi Red и Kaspi QR</strong>.</p>
                  <p>При оформлении заказа на сайте вы получите готовый QR-код и прямую ссылку для быстрой оплаты в приложении Kaspi.</p>
                </div>
              )}
            </div>

            {/* Boutique fitting */}
            <div>
              <button
                onClick={() => toggleAccordion("boutique")}
                className="w-full py-3 flex justify-between items-center text-xs uppercase tracking-wider font-medium text-neutral-800 text-left"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#A0826C]" />
                  <span>Примерка в бутике BUTELLA</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeAccordion === "boutique" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeAccordion === "boutique" && (
                <div className="pb-4 text-xs text-neutral-600 font-light space-y-1.5 leading-relaxed">
                  <p>Бутик находится в центре Кызылорды: <strong>ул. Абая 45</strong>.</p>
                  <p>Работаем ежедневно с 10:00 до 20:00. В бутике просторные примерочные, мягкий свет и профессиональные консультанты.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
