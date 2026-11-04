"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/ecommerce";
import { formatPrice } from "@/lib/utils";
import { ProductModal } from "./ProductModal";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  LogOut,
  ExternalLink,
  Package,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

export function ManageDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/manage/products");
      const data = await res.json();
      if (res.ok && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/manage/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    window.location.reload();
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/manage/products?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setDeleteConfirmId(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const updatedStatus = !product.isActive;
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isActive: updatedStatus } : p))
      );

      await fetch("/api/manage/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          isActive: updatedStatus,
        }),
      });
    } catch (err) {
      console.error("Toggle active error:", err);
      fetchProducts();
    }
  };

  // Metrics
  const totalCount = products.length;
  const activeCount = products.filter((p) => p.isActive).length;
  const lowStockCount = products.filter((p) => {
    const totalStock = p.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
    return totalStock > 0 && totalStock <= 2;
  }).length;
  const hiddenCount = products.filter((p) => !p.isActive).length;

  // Filtered products
  const filtered = products.filter((p) => {
    if (selectedCategory !== "Все" && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-8 border-b border-[#E6DCD1]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#A0826C] font-semibold block">
            Панель управления бутика
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#141414]">
            Каталог товаров BUTELLA
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <Link
            href="/"
            target="_blank"
            className="text-xs uppercase tracking-wider text-neutral-600 hover:text-black flex items-center gap-1.5 transition-colors border border-[#E6DCD1] bg-white px-3.5 py-2 rounded-xs"
          >
            <span>В магазин</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="text-xs uppercase tracking-wider text-neutral-600 hover:text-red-600 flex items-center gap-1.5 transition-colors border border-[#E6DCD1] bg-white px-3.5 py-2 rounded-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Выйти</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="bg-[#141414] text-white px-4 sm:px-5 py-2.5 text-xs uppercase tracking-widest font-medium hover:bg-[#C5A059] hover:text-black transition-all flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить товар</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#FAF8F5] border border-[#E6DCD1] p-4 rounded-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-[11px] uppercase tracking-wider">Всего моделей</span>
            <Package className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="font-serif text-2xl text-[#141414] font-medium">{totalCount}</div>
        </div>

        <div className="bg-[#FAF8F5] border border-[#E6DCD1] p-4 rounded-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-[11px] uppercase tracking-wider">Активны на сайте</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-serif text-2xl text-emerald-700 font-medium">{activeCount}</div>
        </div>

        <div className="bg-[#FAF8F5] border border-[#E6DCD1] p-4 rounded-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-[11px] uppercase tracking-wider">Мало на складе</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-serif text-2xl text-amber-700 font-medium">{lowStockCount}</div>
        </div>

        <div className="bg-[#FAF8F5] border border-[#E6DCD1] p-4 rounded-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-[11px] uppercase tracking-wider">Скрыто с сайта</span>
            <EyeOff className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="font-serif text-2xl text-neutral-500 font-medium">{hiddenCount}</div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию платья или костюма..."
            className="w-full bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-black"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["Все", "Платья", "Костюмы", "Верхняя одежда", "Блузы и топы", "Юбки и брюки"].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-xs transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-[#141414] text-white"
                    : "bg-[#FAF8F5] border border-[#E6DCD1] text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* Product Table / Cards */}
      {loading ? (
        <div className="py-20 text-center text-sm text-neutral-500">Загрузка каталога...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs p-8">
          <p className="font-serif text-xl mb-2 text-[#141414]">Товары не найдены</p>
          <p className="text-xs text-neutral-500 mb-6 font-light">
            По вашему запросу нет позиций или каталог пуст
          </p>
          <button
            onClick={handleOpenAdd}
            className="bg-[#141414] text-white px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-[#C5A059] hover:text-black transition-colors"
          >
            + Добавить первый товар
          </button>
        </div>
      ) : (
        <div className="bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs overflow-hidden">
          <div className="divide-y divide-[#E6DCD1]">
            {filtered.map((p) => {
              const primaryImg = p.images[0]?.imageUrl || "";
              const totalStock = p.variants.reduce((sum, v) => sum + v.stockQuantity, 0);

              return (
                <div
                  key={p.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-22 bg-neutral-200 shrink-0 rounded-xs overflow-hidden border border-[#E6DCD1]">
                      {primaryImg && (
                        <Image
                          src={primaryImg}
                          alt={p.title}
                          fill
                          sizes="80px"
                          className="object-cover object-center"
                        />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">
                          {p.category}
                        </span>
                        {p.isNewArrival && (
                          <span className="bg-[#141414] text-white text-[9px] uppercase px-1.5 py-0.5 rounded-xs">
                            Новинка
                          </span>
                        )}
                        {p.isFeatured && (
                          <span className="bg-[#C5A059] text-black text-[9px] uppercase px-1.5 py-0.5 font-semibold rounded-xs">
                            Хит
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif text-base text-[#141414] font-medium">
                        {p.title}
                      </h3>

                      <div className="text-xs font-semibold text-neutral-900 mt-1">
                        {formatPrice(p.basePrice)}
                      </div>

                      {/* Variants Stock Summary */}
                      <div className="flex flex-wrap gap-1.5 mt-2 text-[10px] text-neutral-600">
                        {p.variants.map((v) => (
                          <span
                            key={v.id}
                            className={`px-1.5 py-0.5 rounded-xs border ${
                              v.stockQuantity === 0
                                ? "bg-red-50 border-red-200 text-red-600 line-through"
                                : v.stockQuantity <= 2
                                ? "bg-amber-50 border-amber-200 text-amber-800"
                                : "bg-white border-[#E6DCD1]"
                            }`}
                          >
                            {v.size}: {v.stockQuantity} шт
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E6DCD1]">
                    {/* Active toggle button */}
                    <button
                      onClick={() => handleToggleActive(p)}
                      className={`text-xs px-3 py-1.5 rounded-xs flex items-center gap-1.5 transition-colors border ${
                        p.isActive
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                          : "bg-neutral-100 text-neutral-500 border-neutral-300 hover:bg-neutral-200"
                      }`}
                      title={p.isActive ? "Скрыть с сайта" : "Сделать видимым на сайте"}
                    >
                      {p.isActive ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>На сайте</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Скрыт</span>
                        </>
                      )}
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-2 text-neutral-600 hover:text-black border border-[#E6DCD1] bg-white rounded-xs hover:bg-neutral-100 transition-colors"
                      title="Редактировать товар"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete button with confirmation */}
                    {deleteConfirmId === p.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="bg-red-600 text-white text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-xs hover:bg-red-700"
                        >
                          Да, удалить
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="bg-neutral-200 text-neutral-700 text-[10px] px-2 py-1.5 rounded-xs hover:bg-neutral-300"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(p.id)}
                        className="p-2 text-neutral-400 hover:text-red-600 border border-[#E6DCD1] bg-white rounded-xs hover:bg-red-50 transition-colors"
                        title="Удалить товар"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Product Creator/Editor Modal */}
      <ProductModal
        isOpen={modalOpen}
        product={editingProduct}
        onClose={() => setModalOpen(false)}
        onSave={fetchProducts}
      />
    </div>
  );
}
