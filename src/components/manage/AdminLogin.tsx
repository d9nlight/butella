"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export function AdminLogin({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/manage/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onLoginSuccess();
      } else {
        setError(data.error || "Неверный пароль владельца бутика");
      }
    } catch {
      setError("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-[#FAF8F5] border border-[#E6DCD1] p-8 sm:p-10 rounded-xs shadow-sm text-center">
        <div className="w-14 h-14 rounded-full bg-[#141414] text-[#C5A059] flex items-center justify-center mx-auto mb-6">
          <Lock className="w-6 h-6 stroke-[1.5]" />
        </div>

        <span className="font-serif text-2xl tracking-[0.25em] text-[#141414] block uppercase mb-1">
          BUTELLA
        </span>
        <h1 className="font-serif text-lg text-neutral-800 mb-2">
          Управление бутиком
        </h1>
        <p className="text-xs text-neutral-500 font-light mb-8">
          Введите пароль владельца для доступа к управлению каталогом, ценами и товарами
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-2 font-medium">
              Пароль владельца
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-white border border-[#E6DCD1] rounded-xs px-4 py-3 text-sm focus:outline-none focus:border-[#141414] transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-neutral-400 hover:text-black"
                aria-label="Показать пароль"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1.5 font-light">
              По умолчанию: <code className="text-neutral-700 bg-neutral-200/60 px-1 py-0.5 rounded">butella2026</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#141414] text-white py-3.5 px-6 text-xs uppercase tracking-widest font-medium hover:bg-[#C5A059] hover:text-black disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Вход...</span>
            ) : (
              <>
                <span>Войти в управление</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
