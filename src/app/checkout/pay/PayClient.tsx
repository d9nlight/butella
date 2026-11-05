"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Copy,
  Check,
  Clock,
  Sparkles,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  MapPin,
  Truck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface OrderInfo {
  orderNumber: string;
  paymentStatus: string;
  orderStatus: string;
  customerName?: string;
  customerPhone?: string;
  deliveryMethod?: string;
  deliveryAddress?: string;
  totalAmount?: number;
  subtotal?: number;
  shippingCost?: number;
  items?: {
    id: string;
    productName: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }[];
}

export function PayClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryOrderNumber = searchParams.get("orderNumber") || "";
  const queryAmount = Number(searchParams.get("amount") || 0);
  const queryName = searchParams.get("name") || "";
  const queryDelivery = searchParams.get("delivery") || "pickup";

  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string>("PENDING");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [testPassword, setTestPassword] = useState("");
  const [simulateError, setSimulateError] = useState("");

  const kaspiPhone = process.env.NEXT_PUBLIC_KASPI_PHONE || "+7 (705) 392-02-88";
  const recipientName = process.env.NEXT_PUBLIC_KASPI_RECIPIENT_NAME || "BUTELLA BOUTIQUE";
  const rawKaspiPhone = kaspiPhone.replace(/\D/g, "");
  const basePayLink = process.env.NEXT_PUBLIC_KASPI_PAY_LINK || "https://kaspi.kz/pay/butella";

  const orderNumber = order?.orderNumber || queryOrderNumber || "BUT-000000";
  const totalAmount = order?.totalAmount || queryAmount || 28500;
  const customerName = order?.customerName || queryName || "Покупатель";
  const deliveryMethod = order?.deliveryMethod || queryDelivery;

  // Kaspi Mobile Deep Link & Web Link
  const kaspiWebLink = `${basePayLink}?order=${encodeURIComponent(orderNumber)}&amount=${totalAmount}`;
  const kaspiAppDeepLink = `kaspi://pay?merchant=${encodeURIComponent(recipientName)}&order=${encodeURIComponent(orderNumber)}&amount=${totalAmount}&phone=${rawKaspiPhone}`;

  // Direct dynamic SVG QR code route
  const qrCodeUrl = `/api/payments/qr?orderNumber=${encodeURIComponent(orderNumber)}&amount=${totalAmount}`;

  // 1. Fetch live order data from Supabase
  const fetchOrderData = useCallback(async () => {
    if (!orderNumber || orderNumber === "BUT-000000") {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/checkout/status?orderNumber=${orderNumber}`);
      if (res.ok) {
        const data: OrderInfo = await res.json();
        setOrder(data);
        if (data.paymentStatus) {
          setPaymentStatus(data.paymentStatus);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch order status:", err);
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    fetchOrderData();
  }, [fetchOrderData]);

  // 2. Poll for payment status change every 2.5 seconds
  useEffect(() => {
    if (paymentStatus === "PAID" || !orderNumber || orderNumber === "BUT-000000" || isRedirecting) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/status?orderNumber=${orderNumber}`);
        if (res.ok) {
          const data = await res.json();
          if (data.paymentStatus === "PAID") {
            setPaymentStatus("PAID");
            setIsRedirecting(true);
            clearInterval(interval);
            // Redirect after short celebration animation
            setTimeout(() => {
              router.push(
                `/checkout/success?orderNumber=${orderNumber}&amount=${totalAmount}&name=${encodeURIComponent(
                  customerName
                )}&delivery=${deliveryMethod}&paid=1`
              );
            }, 1200);
          }
        }
      } catch (err) {
        // Silently retry on network hiccups
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [orderNumber, paymentStatus, isRedirecting, totalAmount, customerName, deliveryMethod, router]);

  // Copy helper
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Test simulation helper (allows store owner to test the auto-redirect flow)
  const handleSimulatePayment = async () => {
    setSimulateError("");
    setSimulating(true);

    try {
      const res = await fetch("/api/payments/kaspi/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": testPassword || "admin_ddd999",
        },
        body: JSON.stringify({
          orderNumber,
          amount: totalAmount,
          txn_id: `SIM-${Math.floor(100000 + Math.random() * 900000)}`,
          status: "PAID",
          secret: testPassword || "admin_ddd999",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowSimulateModal(false);
        setPaymentStatus("PAID");
        setIsRedirecting(true);
        setTimeout(() => {
          router.push(
            `/checkout/success?orderNumber=${orderNumber}&amount=${totalAmount}&name=${encodeURIComponent(
              customerName
            )}&delivery=${deliveryMethod}&paid=1`
          );
        }, 1200);
      } else {
        setSimulateError(data.error || "Не удалось подтвердить оплату. Проверьте пароль.");
      }
    } catch {
      setSimulateError("Ошибка сети при отправке запроса");
    } finally {
      setSimulating(false);
    }
  };

  const isPaid = paymentStatus === "PAID";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
      {/* Top Header */}
      <div className="text-center mb-8">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#A0826C] font-semibold block mb-2">
          Бутик женской одежды • BUTELLA Кызылорда
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#141414] mb-3">
          {isPaid ? "Оплата успешно подтверждена!" : "Оплата заказа через Kaspi"}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 font-light max-w-lg mx-auto">
          {isPaid
            ? `Спасибо за покупку, ${customerName}! Платеж зафиксирован в системе.`
            : `Здравствуйте, ${customerName}! Заказ #${orderNumber} зарегистрирован и ожидает подтверждения перевода.`}
        </p>
      </div>

      {/* Main Grid: Left Payment Details / Right Dynamic QR & App Link */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Payment Status & Requisites (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Status Banner */}
          <div
            className={`p-5 rounded-xs border transition-all duration-500 ${
              isPaid
                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                : "bg-[#FAF8F5] border-[#E6DCD1] text-neutral-800"
            }`}
          >
            <div className="flex items-center gap-3">
              {isPaid ? (
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 animate-scale-in">
                  <CheckCircle2 className="w-6 h-6 stroke-[2]" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 animate-spin" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
                    Статус оплаты
                  </span>
                  <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Автопроверка</span>
                  </span>
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#141414]">
                  {isPaid ? (
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      Оплачено ✅ Перенаправляем на чек...
                    </span>
                  ) : (
                    <span>Ожидаем поступления перевода Kaspi...</span>
                  )}
                </h3>
              </div>
            </div>

            <p className="text-xs text-neutral-500 font-light mt-3 pl-13">
              {isPaid
                ? "Транзакция подтверждена. Бутик BUTELLA уже приступил к подготовке вашего заказа."
                : "Страница обновится автоматически сразу после подтверждения перевода банком или владельцем бутика."}
            </p>
          </div>

          {/* Requisites Card with 1-Click Copy */}
          <div className="bg-white border border-[#E6DCD1] rounded-xs p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#F23B3B] text-white flex items-center justify-center text-[11px] font-bold">
                  K
                </div>
                <h2 className="font-serif text-base text-[#141414]">Реквизиты для перевода</h2>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-[#A0826C] font-semibold">
                Kaspi Gold / QR
              </span>
            </div>

            {/* Field: Phone */}
            <div className="p-3.5 bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-light">
                  Номер телефона получателя
                </span>
                <span className="font-mono text-sm sm:text-base font-semibold text-[#141414]">
                  {kaspiPhone}
                </span>
                <span className="text-[11px] text-neutral-500 font-light block">
                  {recipientName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(kaspiPhone, "phone")}
                className="flex items-center gap-1 text-xs text-[#A0826C] hover:text-black font-medium px-3 py-1.5 border border-[#E6DCD1] bg-white rounded-xs transition-colors"
              >
                {copiedField === "phone" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Скопировано</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Копировать</span>
                  </>
                )}
              </button>
            </div>

            {/* Field: Exact Amount */}
            <div className="p-3.5 bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-light">
                  Точная сумма к оплате
                </span>
                <span className="font-serif text-xl sm:text-2xl font-bold text-[#141414]">
                  {formatPrice(totalAmount)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(String(totalAmount), "amount")}
                className="flex items-center gap-1 text-xs text-[#A0826C] hover:text-black font-medium px-3 py-1.5 border border-[#E6DCD1] bg-white rounded-xs transition-colors"
              >
                {copiedField === "amount" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Скопировано</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Копировать</span>
                  </>
                )}
              </button>
            </div>

            {/* Field: Order Number (Comment) */}
            <div className="p-3.5 bg-[#FFF9E6] border border-[#E6C687] rounded-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#8A6A2E] block font-medium">
                  Сообщение к переводу (ОБЯЗАТЕЛЬНО)
                </span>
                <span className="font-mono text-lg font-bold text-[#141414]">
                  {orderNumber}
                </span>
                <span className="text-[10px] text-[#8A6A2E] font-light block">
                  По этому коду система автоматически распознает ваш платеж
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(orderNumber, "orderNumber")}
                className="flex items-center gap-1 text-xs text-[#141414] hover:text-black font-semibold px-3 py-1.5 border border-[#E6C687] bg-white rounded-xs transition-colors shadow-xs"
              >
                {copiedField === "orderNumber" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Скопировано</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Копировать</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Delivery Note */}
          <div className="p-4 bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs text-xs text-neutral-600 flex items-start gap-3">
            {deliveryMethod === "pickup" ? (
              <>
                <MapPin className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block font-medium">Самовывоз из бутика:</strong>
                  <span>г. Кызылорда, ADS Plaza 116 бутик. Примерка и выдача ежедневно с 10:00 до 20:00.</span>
                </div>
              </>
            ) : (
              <>
                <Truck className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block font-medium">Курьерская доставка:</strong>
                  <span>{order?.deliveryAddress || "Адрес указан при оформлении"}. Менеджер согласует доставку.</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Dynamic QR Code & Mobile Deep Link Button (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border-2 border-[#141414] rounded-xs p-6 sm:p-7 shadow-xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-[11px] font-medium text-neutral-800">
              <Smartphone className="w-3.5 h-3.5 text-[#F23B3B]" />
              <span>Оплата через приложение Kaspi</span>
            </div>

            {/* Dynamic Scalable QR Code Container */}
            <div className="relative mx-auto w-64 h-64 bg-white border border-[#E6DCD1] rounded-xs p-4 flex items-center justify-center shadow-inner">
              {/* Dynamic QR SVG loaded from our API endpoint */}
              <Image
                src={qrCodeUrl}
                alt={`Kaspi QR для заказа ${orderNumber}`}
                width={240}
                height={240}
                className="w-full h-full object-contain"
                unoptimized
                priority
              />

              {/* Center Kaspi Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#F23B3B] text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white pointer-events-none">
                K
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 font-light max-w-xs mx-auto">
              Наведите камеру смартфона на QR-код или откройте сканер в приложении Kaspi.kz
            </p>

            {/* Mobile Action Button */}
            <div className="space-y-2 pt-2">
              <a
                href={kaspiAppDeepLink}
                className="w-full bg-[#F23B3B] hover:bg-[#d92a2a] text-white py-3.5 px-4 text-xs uppercase tracking-wider font-semibold rounded-xs flex items-center justify-center gap-2 transition-colors shadow-md text-center"
              >
                <Smartphone className="w-4 h-4" />
                <span>Оплатить в приложении Kaspi</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={kaspiWebLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center block text-[11px] text-neutral-500 hover:text-black underline font-light pt-1"
              >
                Открыть веб-версию перевода Kaspi
              </a>
            </div>

            <div className="pt-2 border-t border-neutral-100 flex items-center justify-center gap-2 text-[11px] text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Безопасная оплата через Kaspi Bank</span>
            </div>
          </div>

          {/* Test Simulation trigger for owner / dev */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setShowSimulateModal(true)}
              className="text-[11px] text-neutral-400 hover:text-neutral-700 underline font-light"
            >
              🛠 Тест: симуляция подтверждения оплаты
            </button>
          </div>
        </div>
      </div>

      {/* Test Simulation Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6DCD1] rounded-xs max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <h3 className="font-serif text-lg text-[#141414]">Тест системы авто-оплаты</h3>
            <p className="text-xs text-neutral-500 font-light">
              Этот режим отправляет тестовый вебхук на бэкенд от имени Kaspi / банка. Заказ #{orderNumber} будет автоматически переведен в статус «Оплачен», и сработает редирект.
            </p>

            {simulateError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{simulateError}</span>
              </div>
            )}

            <div>
              <label className="text-[11px] text-neutral-600 block mb-1 font-medium">
                Пароль администратора (или вебхука):
              </label>
              <input
                type="password"
                placeholder="admin_ddd999"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xs focus:outline-none focus:border-black"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSimulateModal(false)}
                className="px-4 py-2 text-xs text-neutral-600 hover:text-black"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={simulating}
                className="px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-[#141414] text-white hover:bg-[#A0826C] transition-colors rounded-xs disabled:opacity-50"
              >
                {simulating ? "Отправка..." : "Подтвердить оплату"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
