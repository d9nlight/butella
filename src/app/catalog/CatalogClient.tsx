"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { MOCK_PRODUCTS, CATEGORIES, SIZES } from "@/data/mock-products";
import { ProductCard } from "@/components/product/ProductCard";
import { Filter, SlidersHorizontal, X, Search, RotateCcw } from "lucide-react";
import { Product } from "@/types/ecommerce";

interface CatalogClientProps {
  initialProducts?: Product[];
}

export function CatalogClient({ initialProducts }: CatalogClientProps) {
  const allProducts = initialProducts && initialProducts.length > 0 ? initialProducts : MOCK_PRODUCTS;
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("cat") || "Все";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"featured" | "newest" | "price-asc" | "price-desc">("featured");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync category if URL parameter changes
  React.useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat && CATEGORIES.includes(cat as any)) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Category filter
      if (selectedCategory !== "Все" && product.category !== selectedCategory) {
        return false;
      }

      // Size filter
      if (selectedSize) {
        const hasSize = product.variants.some(
          (v) => v.size === selectedSize && v.stockQuantity > 0
        );
        if (!hasSize) return false;
      }

      // In stock only filter
      if (inStockOnly) {
        const totalStock = product.variants.reduce(
          (sum, v) => sum + v.stockQuantity,
          0
        );
        if (totalStock <= 0) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesCategory = product.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCategory) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "price-asc") {
        return a.basePrice - b.basePrice;
      }
      if (sortBy === "price-desc") {
        return b.basePrice - a.basePrice;
      }
      // "featured" default
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [allProducts, selectedCategory, selectedSize, inStockOnly, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedCategory("Все");
    setSelectedSize("");
    setInStockOnly(false);
    setSearchQuery("");
    setSortBy("featured");
  };

  const hasActiveFilters =
    selectedCategory !== "Все" ||
    selectedSize !== "" ||
    inStockOnly ||
    searchQuery.trim().length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Title & Breadcrumbs */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#A0826C] font-semibold block mb-2">
          Коллекция одежды • Кызылорда
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#141414] tracking-tight">
          Каталог BUTELLA
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 font-light mt-2">
          Выберите наряд для особенного дня или составьте базовый гардероб
        </p>
      </div>

      {/* Search & Mobile Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E6DCD1]">
        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию..."
            className="w-full bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#141414] transition-colors"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-neutral-400 hover:text-black"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Controls: Sort and Mobile Filter Toggle */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="sm:hidden flex items-center gap-2 border border-[#E6DCD1] bg-[#FAF8F5] px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-neutral-800"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Фильтры {hasActiveFilters && "•"}</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 hidden md:inline">Сортировка:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs px-3 py-2.5 text-xs focus:outline-none focus:border-[#141414] text-neutral-800"
            >
              <option value="featured">По популярности</option>
              <option value="newest">Сначала новинки</option>
              <option value="price-asc">Сначала дешевле</option>
              <option value="price-desc">Сначала дороже</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Sidebar Filters (desktop) + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* DESKTOP FILTERS SIDEBAR */}
        <div className="hidden lg:block space-y-8 pr-6 border-r border-[#E6DCD1]">
          {/* Active Filters Reset */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pb-4 border-b border-[#E6DCD1]">
              <span className="text-xs text-neutral-500 font-medium">Фильтры активны</span>
              <button
                onClick={resetFilters}
                className="text-[11px] uppercase tracking-wider text-[#A0826C] hover:text-black flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Сбросить все</span>
              </button>
            </div>
          )}

          {/* Category filter */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#141414] mb-3">
              Категория
            </h3>
            <div className="space-y-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`block w-full text-left text-xs py-1.5 px-2 rounded-xs transition-colors ${
                    selectedCategory === cat
                      ? "bg-[#141414] text-white font-medium"
                      : "text-neutral-600 hover:text-black hover:bg-neutral-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Size filter */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#141414] mb-3">
              Размер
            </h3>
            <div className="grid grid-cols-3 gap-1.5">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(selectedSize === size ? "" : size)}
                  className={`py-2 text-xs font-medium border text-center transition-all ${
                    selectedSize === size
                      ? "border-[#141414] bg-[#141414] text-white"
                      : "border-[#E6DCD1] bg-[#FAF8F5] text-neutral-700 hover:border-black"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Availability checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 text-xs text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded-xs border-neutral-300 accent-[#141414]"
              />
              <span>Только в наличии в Кызылорде</span>
            </label>
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs p-8">
              <p className="font-serif text-xl text-[#141414] mb-2">
                Товары не найдены
              </p>
              <p className="text-xs text-neutral-500 mb-6 font-light max-w-sm mx-auto">
                Попробуйте изменить параметры фильтрации или очистить поиск
              </p>
              <button
                onClick={resetFilters}
                className="bg-[#141414] text-white px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-[#C5A059] hover:text-black transition-colors"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <>
              <div className="text-xs text-neutral-400 mb-4 font-light">
                Найдено моделей: <strong className="text-neutral-800">{filteredProducts.length}</strong>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* MOBILE FILTER MODAL / DRAWER */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex sm:hidden">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-4/5 max-w-xs bg-[#FDFBF7] h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E6DCD1]">
                <h3 className="font-serif text-lg font-medium">Фильтры</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-neutral-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile categories */}
              <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold mb-2">
                  Категория
                </h4>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`block w-full text-left text-xs py-2 px-2.5 rounded-xs ${
                        selectedCategory === cat
                          ? "bg-[#141414] text-white"
                          : "text-neutral-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile sizes */}
              <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold mb-2">
                  Размер
                </h4>
                <div className="grid grid-cols-3 gap-1.5">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(selectedSize === size ? "" : size)}
                      className={`py-2 text-xs font-medium border text-center ${
                        selectedSize === size
                          ? "border-[#141414] bg-[#141414] text-white"
                          : "border-[#E6DCD1] bg-white text-neutral-700"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* In stock only */}
              <div>
                <label className="flex items-center gap-2 text-xs text-neutral-700">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Только в наличии</span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E6DCD1] space-y-2">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full bg-[#141414] text-white py-3 text-xs uppercase tracking-widest font-medium"
              >
                Показать товары ({filteredProducts.length})
              </button>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="w-full text-xs text-neutral-500 py-2 hover:text-black"
                >
                  Сбросить фильтры
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
