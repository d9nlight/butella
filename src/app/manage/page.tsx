import React, { Suspense } from "react";
import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/auth";
import { ManageClient } from "./ManageClient";

export const metadata: Metadata = {
  title: "Управление бутиком — BUTELLA",
  description: "Панель управления товарами бутика женской одежды BUTELLA в Кызылорде",
  robots: {
    index: false,
    follow: false,
  },
};

async function ManageAuthCheck() {
  const isAuth = await isAdminAuthenticated();
  return <ManageClient initialAuth={isAuth} />;
}

export default function ManagePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-xs text-neutral-400 uppercase tracking-widest">
          Проверка доступа к бутика...
        </div>
      }
    >
      <ManageAuthCheck />
    </Suspense>
  );
}
