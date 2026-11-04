"use client";

import React, { useState } from "react";
import { AdminLogin } from "@/components/manage/AdminLogin";
import { ManageDashboard } from "@/components/manage/ManageDashboard";

export function ManageClient({ initialAuth }: { initialAuth: boolean }) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return <ManageDashboard />;
}
