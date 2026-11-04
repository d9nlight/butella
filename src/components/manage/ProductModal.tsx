"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Product, ProductVariant } from "@/types/ecommerce";
import { CATEGORIES } from "@/data/mock-products";
import { X, Upload, Plus, Trash2, Check, AlertCircle } from "lucide-react";

interface ProductModalProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function ProductModal({
  product,
  isOpen,
  onClose,
  onSave,
}: ProductModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Платья");
  const [basePrice, setBasePrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);

  const [images, setImages] = useState<{ imageUrl: string }[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [variants, setVariants] = useState<
    { size: string; color: string; stockQuantity: number }[]
  >([
    { size: "S", color: "Основной", stockQuantity: 3 },
    { size: "M", color: "Основной", stockQuantity: 2 },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Populate data when editing an existing product
  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setCategory(product.category);
      setBasePrice(product.basePrice);
      setDescription(product.description || "");
      setIsActive(product.isActive);
      setIsFeatured(Boolean(product.isFeatured));
      setIsNewArrival(Boolean(product.isNewArrival));
      setImages(product.images.map((img) => ({ imageUrl: img.imageUrl })));
      setVariants(
        product.variants.map((v) => ({
          size: v.size,
          color: v.color,
          stockQuantity: v.stockQuantity,
        }))
      );
    } else {
      // Default new product values
      setTitle("");
      setCategory("Платья");
      setBasePrice("");
      setDescription("");
      setIsActive(true);
      setIsFeatured(false);
      setIsNewArrival(true);
      setImages([]);
      setVariants([
        { size: "S", color: "Основной", stockQuantity: 3 },
        { size: "M", color: "Основной", stockQuantity: 2 },
      ]);
    }
    setError("");
  }, [product, isOpen]);

  if (!isOpen) return null;

  // Handle local file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setError("");

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/manage/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.url) {
          setImages((prev) => [...prev, { imageUrl: data.url }]);
        } else {
          setError(data.error || "Ошибка загрузки фотографии");
        }
      }
    } catch {
      setError("Не удалось загрузить фотографию");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const addCustomImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setImages((prev) => [...prev, { imageUrl: customImageUrl.trim() }]);
    setCustomImageUrl("");
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const addPresetSize = (size: string) => {
    if (variants.some((v) => v.size === size)) return;
    setVariants((prev) => [...prev, { size, color: "Основной", stockQuantity: 2 }]);
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || basePrice === "" || Number(basePrice) < 0) {
      setError("Пожалуйста, укажите корректное название и цену");
      return;
    }

    if (images.length === 0) {
      setError("Добавьте хотя бы одну фотографию товара");
      return;
    }

    if (variants.length === 0) {
      setError("Добавьте хотя бы один размер и количество");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        id: product?.id,
        title: title.trim(),
        category,
        basePrice: Number(basePrice),
        description: description.trim(),
        isActive,
        isFeatured,
        isNewArrival,
        images,
        variants,
      };

      const res = await fetch("/api/manage/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSave();
        onClose();
      } else {
        setError(data.error || "Не удалось сохранить товар");
      }
    } catch {
      setError("Ошибка сети при сохранении товара");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#FDFBF7] text-[#141414] rounded-xs shadow-2xl border border-[#E6DCD1] max-h-[90vh] flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E6DCD1]">
          <div>
            <h2 className="font-serif text-xl font-medium text-[#141414]">
              {product ? "Редактировать товар" : "Добавить новый товар"}
            </h2>
            <p className="text-xs text-neutral-500 font-light">
              Заполните информацию о модели одежды для каталога BUTELLA
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1.5 font-medium">
                Название модели *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="например: Шелковое платье «Aura»"
                required
                className="w-full bg-white border border-[#E6DCD1] rounded-xs px-3.5 py-2.5 text-xs focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1.5 font-medium">
                Категория *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-[#E6DCD1] rounded-xs px-3.5 py-2.5 text-xs focus:outline-none focus:border-black"
              >
                {CATEGORIES.filter((c) => c !== "Все").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & Status Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1.5 font-medium">
                Цена продажи (₸) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={basePrice}
                  onChange={(e) =>
                    setBasePrice(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="28 500"
                  required
                  className="w-full bg-white border border-[#E6DCD1] rounded-xs px-3.5 py-2.5 text-xs focus:outline-none focus:border-black pr-8"
                />
                <span className="absolute right-3 top-2.5 text-xs text-neutral-400">₸</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded-xs accent-[#141414]"
                />
                <span>Отображать на сайте (активен)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="w-4 h-4 rounded-xs accent-[#141414]"
                />
                <span>Показывать в блоке «Новинки»</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded-xs accent-[#141414]"
                />
                <span>Показывать в «Хитах продаж»</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1.5 font-medium">
              Описание и особенности
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Состав ткани, посадка, крой, рекомендации по уходу..."
              className="w-full bg-white border border-[#E6DCD1] rounded-xs px-3.5 py-2.5 text-xs focus:outline-none focus:border-black resize-none"
            />
          </div>

          {/* Photographs Section */}
          <div className="border-t border-[#E6DCD1] pt-4">
            <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-2 font-medium">
              Фотографии товара
            </label>

            {/* Photos preview grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-4">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-3/4 rounded-xs overflow-hidden border border-[#E6DCD1] group bg-neutral-100"
                  >
                    <Image
                      src={img.imageUrl}
                      alt={`Фото ${idx + 1}`}
                      fill
                      sizes="100px"
                      className="object-cover object-center"
                    />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-[#141414] text-white text-[9px] px-1 py-0.5 rounded-xs">
                        Главное
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Удалить фото"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* File upload + URL input */}
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex-1 border-2 border-dashed border-[#E6DCD1] hover:border-[#141414] bg-white rounded-xs p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                <Upload className="w-5 h-5 text-neutral-400 mb-1" />
                <span className="text-xs font-medium text-neutral-700">
                  {uploadingImage ? "Загрузка фото..." : "Загрузить фото с устройства"}
                </span>
                <span className="text-[10px] text-neutral-400">JPG, PNG или WEBP</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>

              <div className="flex-1 flex flex-col justify-center space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">
                  или добавьте ссылку на фото:
                </span>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="https://images.unsplash..."
                    className="flex-1 bg-white border border-[#E6DCD1] rounded-xs px-2.5 py-1.5 text-xs focus:outline-none focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={addCustomImageUrl}
                    className="bg-neutral-800 text-white px-3 py-1.5 text-xs rounded-xs hover:bg-black"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sizes & Stock Section */}
          <div className="border-t border-[#E6DCD1] pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs uppercase tracking-wider text-neutral-600 font-medium">
                Размеры и остаток на складе
              </label>
              {/* Presets */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-neutral-400 mr-1 hidden sm:inline">Добавить:</span>
                {["XS", "S", "M", "L", "XL"].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => addPresetSize(sz)}
                    className="text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded-xs"
                  >
                    +{sz}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white p-2 border border-[#E6DCD1] rounded-xs"
                >
                  <div className="w-20">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 block">Размер</span>
                    <input
                      type="text"
                      value={v.size}
                      onChange={(e) => updateVariant(idx, "size", e.target.value)}
                      placeholder="S"
                      className="w-full text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="flex-1">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 block">Цвет</span>
                    <input
                      type="text"
                      value={v.color}
                      onChange={(e) => updateVariant(idx, "color", e.target.value)}
                      placeholder="Основной"
                      className="w-full text-xs focus:outline-none"
                    />
                  </div>

                  <div className="w-24">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 block">Остаток (шт.)</span>
                    <input
                      type="number"
                      min="0"
                      value={v.stockQuantity}
                      onChange={(e) =>
                        updateVariant(idx, "stockQuantity", Math.max(0, Number(e.target.value)))
                      }
                      className="w-full text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
                    title="Удалить размер"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setVariants((prev) => [
                    ...prev,
                    { size: "M", color: "Основной", stockQuantity: 1 },
                  ])
                }
                className="text-xs text-neutral-600 hover:text-black flex items-center gap-1 font-medium pt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить еще размер вручную</span>
              </button>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#E6DCD1] bg-[#FAF8F5]">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 text-xs uppercase tracking-wider text-neutral-600 hover:text-black transition-colors"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="bg-[#141414] text-white px-6 py-2.5 text-xs uppercase tracking-widest font-medium hover:bg-[#C5A059] hover:text-black disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving ? (
              <span>Сохранение...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{product ? "Сохранить изменения" : "Опубликовать товар"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
