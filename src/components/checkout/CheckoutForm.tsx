"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { DeliveryMethod, DeliveryOption } from "@/types/ecommerce";
import { formatPrice } from "@/lib/utils";
import {
  createWhatsAppOrderLink,
  WHATSAPP_DISPLAY_PHONE,
} from "@/lib/whatsapp";
import {
  MapPin,
  Truck,
  ArrowRight,
  AlertCircle,
  ShoppingBag,
  Send,
  MessageCircle,
} from "lucide-react";

interface CheckoutFormProps {
  deliveryOptions: DeliveryOption[];
}

export function CheckoutForm({ deliveryOptions }: CheckoutFormProps) {
  const { items, subtotal, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+7 ");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pickup");
  const [cityAddress, setCityAddress] = useState("");
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  // Handle phone input with friendly Kazakhstan phone mask: +7 (7XX) XXX-XX-XX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "");

    if (input.startsWith("8")) {
      input = "7" + input.slice(1);
    }
    if (!input.startsWith("7")) {
      input = "7" + input;
    }

    input = input.slice(0, 11);

    let formatted = "+7 ";
    if (input.length > 1) {
      formatted += `(${input.slice(1, 4)}`;
    }
    if (input.length >= 4) {
      formatted += `) ${input.slice(4, 7)}`;
    }
    if (input.length >= 7) {
      formatted += `-${input.slice(7, 9)}`;
    }
    if (input.length >= 9) {
      formatted += `-${input.slice(9, 11)}`;
    }

    setCustomerPhone(formatted);
  };

  const selectedDeliveryOption =
    deliveryOptions.find((opt) => opt.id === deliveryMethod) || deliveryOptions[0];

  const shippingCost = selectedDeliveryOption.price;
  const totalAmount = subtotal + shippingCost;

  if (items.length === 0 && !whatsappUrl) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E6DCD1] flex items-center justify-center mx-auto mb-4 text-neutral-400">
          <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
        </div>
        <h2 className="font-serif text-2xl mb-2 text-[#141414]">Ваша корзина пуста</h2>
        <p className="text-xs text-neutral-500 font-light mb-6">
          Перед оформлением заказа выберите понравившиеся модели в каталоге
        </p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 bg-[#141414] text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-[#C5A059] hover:text-black transition-colors"
        >
          <span>В каталог одежды</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!customerName.trim() || customerName.trim().length < 2) {
      setError("Пожалуйста, введите ваше имя (минимум 2 символа)");
      return;
    }

    if (deliveryMethod !== "pickup" && (!cityAddress || cityAddress.trim().length < 3)) {
      setError("Укажите город и адрес для доставки");
      return;
    }

    setSubmitting(true);

    try {
      const url = createWhatsAppOrderLink({
        customerName: customerName.trim(),
        customerPhone: customerPhone.length > 5 ? customerPhone.trim() : undefined,
        deliveryMethod,
        cityAddress: deliveryMethod !== "pickup" ? cityAddress.trim() : "Самовывоз из бутика (г. Кызылорда, ул. Абая 45)",
        comment: comment.trim(),
        items: items.map((i) => ({
          title: i.title,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          price: i.price,
        })),
        totalAmount,
      });

      setWhatsappUrl(url);
      clearCart();

      // Attempt opening in new window/tab, fallback to current window
      try {
        const win = window.open(url, "_blank");
        if (!win || win.closed || typeof win.closed === "undefined") {
          window.location.href = url;
        }
      } catch {
        window.location.href = url;
      }
    } catch {
      setError("Не удалось сформировать ссылку на WhatsApp");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* If WhatsApp redirect occurred */}
      {whatsappUrl ? (
        <div className="bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl text-[#141414]">
            Переходим в WhatsApp...
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed font-light">
            Сейчас откроется чат с менеджером бутика <strong>BUTELLA</strong> на номере{" "}
            <strong>{WHATSAPP_DISPLAY_PHONE}</strong> с готовым текстом вашего заказа.
          </p>
          <div className="pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-4 text-xs uppercase tracking-widest font-semibold rounded-xs shadow-md hover:bg-[#20ba59] transition-all"
            >
              <span>Открыть WhatsApp вручную</span>
              <Send className="w-4 h-4" />
            </a>
          </div>
          <div className="pt-4">
            <Link
              href="/"
              className="text-xs text-neutral-500 hover:text-black uppercase tracking-wider"
            >
              Вернуться на главную
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* LEFT: Short Checkout Info (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. Customer Information */}
            <div className="bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E6DCD1]">
                <span className="w-5 h-5 rounded-full bg-[#141414] text-white text-[11px] font-semibold flex items-center justify-center">
                  1
                </span>
                <h2 className="font-serif text-lg text-[#141414]">Контактные данные</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1.5 font-medium">
                    Ваше имя *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Айгерим"
                    required
                    className="w-full bg-white border border-[#E6DCD1] rounded-xs px-3.5 py-3 text-xs focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1.5 font-medium">
                    Номер телефона (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={handlePhoneChange}
                    placeholder="+7 (777) 123-45-67"
                    className="w-full bg-white border border-[#E6DCD1] rounded-xs px-3.5 py-3 text-xs focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Method */}
            <div className="bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E6DCD1]">
                <span className="w-5 h-5 rounded-full bg-[#141414] text-white text-[11px] font-semibold flex items-center justify-center">
                  2
                </span>
                <h2 className="font-serif text-lg text-[#141414]">Способ получения</h2>
              </div>

              <div className="space-y-3 pt-1">
                {deliveryOptions.map((opt) => {
                  const isSelected = deliveryMethod === opt.id;
                  return (
                    <label
                      key={opt.id}
                      onClick={() => setDeliveryMethod(opt.id)}
                      className={`flex items-start justify-between p-4 rounded-xs border cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#141414] bg-white shadow-xs"
                          : "border-[#E6DCD1] bg-[#FAF8F5] hover:border-neutral-400"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          checked={isSelected}
                          onChange={() => setDeliveryMethod(opt.id)}
                          className="mt-0.5 w-4 h-4 accent-[#141414]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#141414]">
                              {opt.title}
                            </span>
                            {opt.badge && (
                              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-[#E6DCD1]/60 text-neutral-800">
                                {opt.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500 font-light mt-1">
                            {opt.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-[#141414] shrink-0 ml-4">
                        {opt.price === 0 ? "Бесплатно" : formatPrice(opt.price)}
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* City / Address field if delivery */}
              {deliveryMethod !== "pickup" && (
                <div className="pt-3 animate-fade-in">
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1.5 font-medium">
                    Город и адрес доставки *
                  </label>
                  <textarea
                    value={cityAddress}
                    onChange={(e) => setCityAddress(e.target.value)}
                    rows={2}
                    placeholder="например: г. Кызылорда, мкр. Акмешит 14, кв. 20 (или г. Алматы...)"
                    required
                    className="w-full bg-white border border-[#E6DCD1] rounded-xs px-3.5 py-2.5 text-xs focus:outline-none focus:border-black resize-none"
                  />
                </div>
              )}

              {/* Optional Comment */}
              <div className="pt-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1.5 font-medium">
                  Комментарий или пожелания по размеру
                </label>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="например: рост 168 см, нужен совет по посадке"
                  className="w-full bg-white border border-[#E6DCD1] rounded-xs px-3.5 py-2.5 text-xs focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* 3. Direct WhatsApp Notice */}
            <div className="bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs p-6">
              <div className="flex items-center gap-3.5 bg-white p-4 border border-[#E6DCD1] rounded-xs">
                <div className="w-10 h-10 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="text-xs space-y-0.5">
                  <strong className="text-neutral-900 block font-semibold">
                    Мгновенное оформление в WhatsApp ({WHATSAPP_DISPLAY_PHONE})
                  </strong>
                  <p className="text-neutral-500 font-light">
                    После нажатия кнопки вас перенаправит в WhatsApp к менеджеру бутика с уже готовым текстом заказа.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Order Summary Card (5 cols) */}
          <div className="lg:col-span-5 sticky top-28 bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs p-6 space-y-6">
            <h2 className="font-serif text-xl text-[#141414] pb-3 border-b border-[#E6DCD1]">
              Ваш заказ ({items.length})
            </h2>

            {/* Items List */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1 divide-y divide-[#E6DCD1]/60">
              {items.map((item) => (
                <div key={item.variantId} className="pt-3 first:pt-0 flex gap-3.5 items-center">
                  <div className="relative w-14 h-18 bg-neutral-200 shrink-0 rounded-xs overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="60px"
                      className="object-cover object-center"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-xs font-medium text-[#141414] truncate">
                      {item.title}
                    </h4>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      Размер: <strong className="text-neutral-800">{item.size}</strong> • {item.color}
                    </div>
                    <div className="text-xs text-neutral-600 mt-1">
                      {item.quantity} шт. × {formatPrice(item.price)}
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-[#141414] text-right">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Cost Breakdown */}
            <div className="border-t border-[#E6DCD1] pt-4 space-y-2 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Стоимость товаров:</span>
                <span className="font-medium text-neutral-900">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>Доставка ({selectedDeliveryOption.title}):</span>
                <span className="font-medium text-neutral-900">
                  {shippingCost === 0 ? "Бесплатно" : formatPrice(shippingCost)}
                </span>
              </div>

              <div className="border-t border-[#E6DCD1] pt-3 flex justify-between text-base font-semibold text-[#141414]">
                <span>Итого к оплате:</span>
                <span className="font-serif text-xl">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* WhatsApp Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-4 px-6 text-xs uppercase tracking-widest font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md rounded-xs"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? "Переход в WhatsApp..." : "Оформить заказ в WhatsApp"}</span>
            </button>

            <div className="text-[11px] text-neutral-400 space-y-1 pt-1 text-center font-light">
              <p>Менеджер сразу ответит вам в WhatsApp, подтвердит заказ и согласует доставку.</p>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
