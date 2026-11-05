"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Copy,
  Check,
  Clock,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  MapPin,
  Truck,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
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
  const [, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string>("PENDING");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Exact store credentials
  const kaspiPhone = "+7 (705) 392-02-88";
  const rawKaspiPhone = "77053920288";
  const recipientName = "BUTELLA BOUTIQUE";

  const orderNumber = order?.orderNumber || queryOrderNumber || "BUT-000000";
  const totalAmount = order?.totalAmount || queryAmount || 28500;
  const customerName = order?.customerName || queryName || "Покупатель";
  const deliveryMethod = order?.deliveryMethod || queryDelivery;

  // Kaspi app link (opens Kaspi app on iOS/Android or web portal)
  const kaspiAppUrl = "https://kaspi.kz";

  // Direct dynamic SVG QR code route
  const qrCodeUrl = `/api/payments/qr?orderNumber=${encodeURIComponent(orderNumber)}&amount=${totalAmount}`;

  // WhatsApp helper link
  const whatsappUrl = `https://wa.me/77779418188?text=${encodeURIComponent(
    `Здравствуйте! Я оформил(а) заказ #${orderNumber} на сумму ${formatPrice(
      totalAmount
    )} и перевожу оплату на Kaspi (+7 705 392 0288).`
  )}`;

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
            // Redirect after celebration animation
            setTimeout(() => {
              router.push(
                `/checkout/success?orderNumber=${orderNumber}&amount=${totalAmount}&name=${encodeURIComponent(
                  customerName
                )}&delivery=${deliveryMethod}&paid=1`
              );
            }, 1200);
          }
        }
      } catch {
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
            : `Здравствуйте, ${customerName}! Заказ #${orderNumber} зарегистрирован. Совершите перевод на Kaspi по реквизитам ниже:`}
        </p>
      </div>

      {/* Main Grid: Left Payment Details / Right Dynamic QR */}
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
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
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
                    Статус платежа
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
                    <span>Ожидаем подтверждения перевода...</span>
                  )}
                </h3>
              </div>
            </div>

            <p className="text-xs text-neutral-500 font-light mt-3 pl-13">
              {isPaid
                ? "Платеж принят. Бутик BUTELLA уже приступил к подготовке вашего заказа."
                : "Как только вы отправите перевод, статус автоматически изменится на «Оплачено»."}
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
                Kaspi Gold
              </span>
            </div>

            {/* Field: Recipient Phone */}
            <div className="p-3.5 bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-light">
                  Номер телефона получателя Kaspi
                </span>
                <span className="font-mono text-base sm:text-lg font-bold text-[#141414]">
                  {kaspiPhone}
                </span>
                <span className="text-[11px] text-neutral-500 font-light block">
                  {recipientName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(rawKaspiPhone, "phone")}
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
                  Укажите этот код в комментарии, чтобы оплата привязалась к заказу
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

          {/* Simple 3-Step Instructions */}
          <div className="bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs p-5 text-xs text-neutral-600 space-y-2.5">
            <h3 className="font-serif text-sm font-semibold text-[#141414]">
              Как оплатить через Kaspi:
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 font-light text-neutral-700">
              <li>
                Скопируйте номер получателя: <strong>{kaspiPhone}</strong>
              </li>
              <li>
                Откройте приложение Kaspi → раздел <strong>«Переводы»</strong> → <strong>«Клиенту Kaspi»</strong>
              </li>
              <li>
                Вставьте номер, укажите сумму <strong>{formatPrice(totalAmount)}</strong> и в сообщении впишите код <strong>{orderNumber}</strong>
              </li>
              <li>
                Нажмите перевести. Статус заказа на этой странице обновится автоматически!
              </li>
            </ol>
          </div>

          {/* Delivery Note */}
          <div className="p-4 bg-white border border-[#E6DCD1] rounded-xs text-xs text-neutral-600 flex items-start gap-3">
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

        {/* RIGHT COLUMN: QR Code & Mobile Launch Button (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border-2 border-[#141414] rounded-xs p-6 sm:p-7 shadow-xl text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-[11px] font-medium text-neutral-800">
              <Smartphone className="w-3.5 h-3.5 text-[#F23B3B]" />
              <span>Оплата через Kaspi</span>
            </div>

            {/* Dynamic Scalable QR Container */}
            <div className="relative mx-auto w-64 h-64 bg-white border border-[#E6DCD1] rounded-xs p-4 flex items-center justify-center shadow-inner">
              <Image
                src={qrCodeUrl}
                alt={`QR код заказа ${orderNumber}`}
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
              Наведите камеру смартфона на QR-код, чтобы открыть этот заказ на телефоне
            </p>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <a
                href={kaspiAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#F23B3B] hover:bg-[#d92a2a] text-white py-3.5 px-4 text-xs uppercase tracking-wider font-semibold rounded-xs flex items-center justify-center gap-2 transition-colors shadow-md text-center"
              >
                <Smartphone className="w-4 h-4" />
                <span>Открыть приложение Kaspi</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20b858] text-white py-3 px-4 text-xs uppercase tracking-wider font-medium rounded-xs flex items-center justify-center gap-2 transition-colors text-center shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Отправить чек в WhatsApp</span>
              </a>
            </div>

            <div className="pt-2 border-t border-neutral-100 flex items-center justify-center gap-2 text-[11px] text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Безопасный перевод на Kaspi Gold</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
