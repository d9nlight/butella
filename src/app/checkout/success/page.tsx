"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  QrCode,
  Phone,
  MapPin,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  Clock,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || "BUT-000000";
  const amount = Number(searchParams.get("amount") || 0);
  const customerName = searchParams.get("name") || "Покупатель";
  const delivery = searchParams.get("delivery") || "pickup";

  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>("PENDING");

  const kaspiPhone = process.env.NEXT_PUBLIC_KASPI_PHONE || "+7 (777) 123-45-67";
  const recipientName = process.env.NEXT_PUBLIC_KASPI_RECIPIENT_NAME || "BUTELLA BOUTIQUE";
  const kaspiPayLink = process.env.NEXT_PUBLIC_KASPI_PAY_LINK || "https://kaspi.kz/pay/butella";

  // Poll for payment status change (e.g. when owner confirms in Telegram)
  useEffect(() => {
    if (paymentStatus === "PAID" || !orderNumber || orderNumber === "BUT-000000") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/status?orderNumber=${orderNumber}`);
        const data = await res.json();
        if (data && data.paymentStatus === "PAID") {
          setPaymentStatus("PAID");
          clearInterval(interval);
        }
      } catch (err) {
        // Silently retry
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [orderNumber, paymentStatus]);

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPaid = paymentStatus === "PAID";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
      {/* Success Badge */}
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-500 ${
          isPaid ? "bg-emerald-600 text-white shadow-lg" : "bg-emerald-100 text-emerald-700"
        }`}
      >
        <CheckCircle2 className="w-9 h-9 stroke-[1.75]" />
      </div>

      <span className="text-[10px] uppercase tracking-[0.3em] text-[#A0826C] font-semibold block mb-2">
        {isPaid ? "Оплата успешно подтверждена" : "Заказ успешно зарегистрирован"}
      </span>

      <h1 className="font-serif text-3xl sm:text-4xl text-[#141414] mb-3">
        {isPaid ? `Оплата получена! Спасибо, ${customerName}` : `Спасибо за заказ, ${customerName}!`}
      </h1>

      <p className="text-sm text-neutral-500 font-light max-w-md mx-auto mb-8">
        {isPaid
          ? "Мы получили оплату и приступили к сборке вашего заказа. Спасибо за выбор бутика BUTELLA!"
          : "Уведомление о вашем заказе уже отправлено владельцу бутика. Для завершения оформления произведите оплату через Kaspi."}
      </p>

      {/* Order Number Box */}
      <div className="bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs p-5 max-w-md mx-auto mb-8 flex items-center justify-between">
        <div className="text-left">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-light">
            Номер вашего заказа
          </span>
          <span className="font-serif text-xl sm:text-2xl font-semibold text-[#141414]">
            {orderNumber}
          </span>
        </div>

        <button
          onClick={handleCopyOrderNumber}
          className="flex items-center gap-1.5 text-xs text-[#A0826C] hover:text-black font-medium border border-[#E6DCD1] bg-white px-3 py-1.5 rounded-xs transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Скопировано</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Скопировать</span>
            </>
          )}
        </button>
      </div>

      {/* Real-time Payment Status Pill */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium mb-8">
        {isPaid ? (
          <span className="text-emerald-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Оплата через Kaspi подтверждена ✅</span>
          </span>
        ) : (
          <span className="text-amber-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>Ожидаем подтверждения перевода Kaspi...</span>
          </span>
        )}
      </div>

      {/* Kaspi Payment Box (only if not yet paid) */}
      {!isPaid && (
        <div className="bg-white border-2 border-[#141414] rounded-xs p-6 sm:p-8 max-w-md mx-auto text-left shadow-lg mb-10 space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#F23B3B] text-white flex items-center justify-center font-bold text-xs">
                K
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#141414]">Оплата через Kaspi</h3>
                <span className="text-[11px] text-neutral-500 font-light">Kaspi QR / Перевод</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">К оплате</span>
              <span className="font-serif text-lg font-bold text-[#141414]">
                {formatPrice(amount)}
              </span>
            </div>
          </div>

          {/* Visual QR Card */}
          <div className="flex flex-col items-center justify-center p-6 bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs text-center space-y-2">
            <QrCode className="w-28 h-28 text-neutral-800" />
            <p className="text-[11px] text-neutral-500 font-light max-w-xs">
              Отсканируйте в приложении Kaspi или перейдите по кнопке ниже:
            </p>
          </div>

          {/* Instructions */}
          <div className="text-xs space-y-2 text-neutral-600 font-light">
            <div className="flex justify-between">
              <span className="text-neutral-400">Номер телефона:</span>
              <strong className="text-neutral-900 font-medium">{kaspiPhone}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Получатель:</span>
              <strong className="text-neutral-900 font-medium">{recipientName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">В сообщении укажите:</span>
              <strong className="text-[#141414] font-semibold">{orderNumber}</strong>
            </div>
          </div>

          {/* Action Button */}
          <a
            href={kaspiPayLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#F23B3B] hover:bg-[#d92a2a] text-white py-3.5 px-4 text-xs uppercase tracking-wider font-semibold rounded-xs flex items-center justify-center gap-2 transition-colors text-center shadow-sm"
          >
            <span>Оплатить в приложении Kaspi</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Delivery Note */}
      <div className="max-w-md mx-auto mb-10 text-xs text-neutral-500 font-light space-y-2">
        {delivery === "pickup" ? (
          <div className="p-4 bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs flex items-start gap-3 text-left">
            <MapPin className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-800 block font-medium">Самовывоз из бутика:</strong>
              <span>г. Кызылорда, ул. Абая 45. Ждем вас на примерку ежедневно с 10:00 до 20:00.</span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs flex items-start gap-3 text-left">
            <Phone className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-800 block font-medium">Доставка курьером:</strong>
              <span>Менеджер бутика свяжется с вами по указанному телефону для согласования удобного времени.</span>
            </div>
          </div>
        )}
      </div>

      {/* Return to Home / WhatsApp Contact */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/"
          className="w-full sm:w-auto bg-[#141414] text-white px-8 py-3.5 text-xs uppercase tracking-widest font-medium hover:bg-[#C5A059] hover:text-black transition-colors"
        >
          Вернуться на главную
        </Link>
        <a
          href={`https://wa.me/77771234567?text=${encodeURIComponent(
            `Здравствуйте! Я оформил(а) заказ #${orderNumber} на сумму ${amount} ₸.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto border border-neutral-300 text-neutral-800 px-8 py-3.5 text-xs uppercase tracking-widest hover:border-black transition-colors"
        >
          Написать в WhatsApp бутика
        </a>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-neutral-400">
          Загрузка информации о заказе...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
