import React, { Suspense } from "react";
import type { Metadata } from "next";
import { PayClient } from "./PayClient";

export const metadata: Metadata = {
  title: "Оплата заказа через Kaspi — Бутик BUTELLA",
  description: "Оплата заказа через Kaspi QR или перевод с автоматическим подтверждением.",
};

export default function PayPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto py-24 px-4 text-center">
          <div className="w-10 h-10 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest text-neutral-400">
            Загрузка платежных реквизитов...
          </p>
        </div>
      }
    >
      <PayClient />
    </Suspense>
  );
}
