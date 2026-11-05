"use client";

import React, { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  MapPin,
  Truck,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface OrderData {
  orderNumber: string;
  paymentStatus: string;
  orderStatus: string;
  customerName?: string;
  customerPhone?: string;
  deliveryMethod?: string;
  deliveryAddress?: string;
  comment?: string;
  subtotal?: number;
  shippingCost?: number;
  totalAmount?: number;
  createdAt?: string;
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

function SuccessContent() {
  const searchParams = useSearchParams();
  const queryOrderNumber = searchParams.get("orderNumber") || "BUT-000000";
  const queryAmount = Number(searchParams.get("amount") || 0);
  const queryName = searchParams.get("name") || "";
  const queryDelivery = searchParams.get("delivery") || "pickup";
  const queryPaid = searchParams.get("paid") === "1";

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>(
    queryPaid ? "PAID" : "PENDING"
  );

  const orderNumber = order?.orderNumber || queryOrderNumber;
  const totalAmount = order?.totalAmount || queryAmount || 0;
  const customerName = order?.customerName || queryName || "Покупатель";
  const deliveryMethod = order?.deliveryMethod || queryDelivery;

  const fetchOrderDetails = useCallback(async () => {
    if (!orderNumber || orderNumber === "BUT-000000") {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/checkout/status?orderNumber=${orderNumber}`);
      if (res.ok) {
        const data: OrderData = await res.json();
        setOrder(data);
        if (data.paymentStatus) {
          setPaymentStatus(data.paymentStatus);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch order details:", err);
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // Polling in case status changes while customer is on this page
  useEffect(() => {
    if (paymentStatus === "PAID" || !orderNumber || orderNumber === "BUT-000000") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/status?orderNumber=${orderNumber}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.paymentStatus === "PAID") {
            setPaymentStatus("PAID");
            clearInterval(interval);
          }
        }
      } catch {
        // Retry silently
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderNumber, paymentStatus]);

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPaid = paymentStatus === "PAID";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center">
      {/* Success Badge */}
      <div
        className={`w-18 h-18 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-500 shadow-md ${
          isPaid
            ? "bg-emerald-600 text-white shadow-emerald-200"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        <CheckCircle2 className="w-10 h-10 stroke-[1.8]" />
      </div>

      <span className="text-[10px] uppercase tracking-[0.3em] text-[#A0826C] font-semibold block mb-2">
        {isPaid ? "Оплата успешно подтверждена" : "Заказ зарегистрирован"}
      </span>

      <h1 className="font-serif text-3xl sm:text-4xl text-[#141414] mb-3">
        {isPaid
          ? `Спасибо за заказ, ${customerName}!`
          : `Заказ #${orderNumber} ожидает оплаты`}
      </h1>

      <p className="text-sm text-neutral-500 font-light max-w-md mx-auto mb-8">
        {isPaid
          ? "Мы получили оплату через Kaspi и уже бережно собираем ваш заказ в бутике BUTELLA."
          : "Для завершения оформления заказа, пожалуйста, перейдите на страницу оплаты Kaspi."}
      </p>

      {/* Order Number Box */}
      <div className="bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs p-5 max-w-md mx-auto mb-8 flex items-center justify-between shadow-2xs">
        <div className="text-left">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-light">
            Номер вашего заказа
          </span>
          <span className="font-serif text-2xl font-bold text-[#141414]">
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

      {/* Payment Status Pill */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium mb-8">
        {isPaid ? (
          <span className="text-emerald-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Оплачено через Kaspi ✅</span>
          </span>
        ) : (
          <span className="text-amber-800 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-600" />
            <span>Ожидает оплаты</span>
          </span>
        )}
      </div>

      {/* If Not Paid yet: direct link to Payment page */}
      {!isPaid && (
        <div className="max-w-md mx-auto mb-10 p-5 bg-[#FFF9E6] border border-[#E6C687] rounded-xs text-left space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-medium text-xs">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Оплата еще не завершена</span>
          </div>
          <p className="text-xs text-neutral-600 font-light">
            Чтобы мы начали сборку вашего заказа, отсканируйте Kaspi QR или совершите перевод по реквизитам бутика:
          </p>
          <Link
            href={`/checkout/pay?orderNumber=${orderNumber}&amount=${totalAmount}&name=${encodeURIComponent(
              customerName
            )}&delivery=${deliveryMethod}`}
            className="w-full bg-[#F23B3B] hover:bg-[#d92a2a] text-white py-3 px-4 text-xs uppercase tracking-wider font-semibold rounded-xs flex items-center justify-center gap-2 transition-colors text-center"
          >
            <span>Перейти к оплате через Kaspi</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Order Receipt Details (Items & Pricing) */}
      {order?.items && order.items.length > 0 && (
        <div className="bg-white border border-[#E6DCD1] rounded-xs p-6 max-w-md mx-auto mb-8 text-left shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <ShoppingBag className="w-4 h-4 text-[#A0826C]" />
            <h2 className="font-serif text-base text-[#141414]">Состав заказа</h2>
          </div>

          <div className="divide-y divide-neutral-100 space-y-3">
            {order.items.map((item, idx) => (
              <div key={item.id || idx} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {item.imageUrl && (
                    <div className="relative w-10 h-12 bg-neutral-100 rounded-xs overflow-hidden shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-neutral-900 line-clamp-1">{item.productName}</h3>
                    <p className="text-neutral-500 text-[11px] font-light">
                      Размер: {item.size} • {item.color} • {item.quantity} шт.
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-neutral-900 shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-neutral-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-neutral-500 font-light">
              <span>Стоимость товаров:</span>
              <span>{formatPrice(order.subtotal || totalAmount)}</span>
            </div>
            <div className="flex justify-between text-neutral-500 font-light">
              <span>Доставка:</span>
              <span>
                {order.shippingCost === 0 ? "Бесплатно" : formatPrice(order.shippingCost || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-neutral-900 pt-2 border-t border-neutral-100">
              <span>Итого:</span>
              <span className="font-serif text-base">{formatPrice(totalAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Note */}
      <div className="max-w-md mx-auto mb-10 text-xs text-neutral-600 font-light">
        {deliveryMethod === "pickup" ? (
          <div className="p-4 bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs flex items-start gap-3 text-left">
            <MapPin className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-900 block font-medium">Самовывоз из бутика:</strong>
              <span>
                г. Кызылорда, ADS Plaza 116 бутик. Ждем вас на примерку и получение ежедневно с 10:00 до 20:00.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs flex items-start gap-3 text-left">
            <Truck className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-900 block font-medium">Курьерская доставка:</strong>
              <span>
                {order?.deliveryAddress || "Кызылорда / Казахстан"}. Наш менеджер свяжется с вами для уточнения деталей.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/"
          className="w-full sm:w-auto bg-[#141414] text-white px-8 py-3.5 text-xs uppercase tracking-widest font-medium hover:bg-[#C5A059] hover:text-black transition-colors"
        >
          Вернуться на главную
        </Link>
        <a
          href={`https://wa.me/77779418188?text=${encodeURIComponent(
            `Здравствуйте! Я оформил(а) заказ #${orderNumber} на сумму ${formatPrice(totalAmount)}.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto border border-neutral-300 text-neutral-800 px-8 py-3.5 text-xs uppercase tracking-widest hover:border-black transition-colors flex items-center justify-center gap-2"
        >
          <span>Написать в WhatsApp бутика</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs text-neutral-400">
          Загрузка информации о заказе...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
