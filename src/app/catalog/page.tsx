import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getProducts } from "@/lib/supabase/products";
import { CatalogClient } from "./CatalogClient";

export const metadata: Metadata = {
  title: "Каталог одежды — Бутик BUTELLA Кызылорда",
  description:
    "Эксклюзивная коллекция женской одежды бутика BUTELLA в Кызылорде. Платья, костюмы, пальто, блузы.",
};

async function CatalogContentWrapper() {
  const products = await getProducts();
  return <CatalogClient initialProducts={products} />;
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-neutral-500">
          Загрузка каталога...
        </div>
      }
    >
      <CatalogContentWrapper />
    </Suspense>
  );
}
