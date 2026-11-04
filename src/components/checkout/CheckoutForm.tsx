"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { DeliveryMethod, DeliveryOption } from "@/types/ecommerce";
import { formatPrice } from "@/lib/utils";
import {
  MapPin,
  Truck,
  Building,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";

interface CheckoutFormProps {
  deliveryOptions: DeliveryOption[];
}

export function CheckoutForm({ deliveryOptions }: CheckoutFormProps) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+7 ");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E6DCD1] flex items-center justify-center mx-auto mb-4 text-neutral-400">
          <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
        </div>
        <h2 className="font-serif text-2xl mb-2 text-[#141414]">Ваша корзина пуста</h2>
        <p className="text-xs text-neutral-500 font-light mb-6">
          Перед оформлением заказа выберите понравившиеся товары в каталоге
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!customerName.trim() || customerName.trim().length < 2) {
      setError("Пожалуйста, введите ваше имя (минимум 2 символа)");
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 11) {
      setError("Пожалуйста, введите полный номер телефона: +7 (7XX) XXX-XX-XX");
      return;
    }

    if (deliveryMethod !== "pickup" && (!deliveryAddress || deliveryAddress.trim().length < 5)) {
      setError("Укажите полный адрес доставки (город, улица, дом)");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone,
        deliveryMethod,
        deliveryAddress: deliveryMethod !== "pickup" ? deliveryAddress.trim() : "",
        comment: comment.trim(),
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          title: i.title,
          size: i.size,
          color: i.color,
          image: i.image,
          quantity: i.quantity,
        })),
      };

      const res = await fetch("/api/checkout/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        clearCart();
        router.push(
          `/checkout/success?orderNumber=${data.orderNumber}&amount=${data.totalAmount}&name=${encodeURIComponent(
            customerName
          )}&delivery=${deliveryMethod}`
        );
      } else {
        setError(data.error || "Не удалось создать заказ. Попробуйте снова.");
        setSubmitting(false);
      }
    } catch {
      setError("Ошибка сети при отправке заказа. Проверьте интернет-соединение.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      {/* LEFT: Checkout Details (7 cols) */}
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
                Номер телефона (Kaspi) *
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={handlePhoneChange}
                placeholder="+7 (777) 123-45-67"
                required
                className="w-full bg-white border border-[#E6DCD1] rounded-xs px-3.5 py-3 text-xs focus:outline-none focus:border-black"
              />
            </div>
          </div>
          <p className="text-[11px] text-neutral-400 font-light">
            На этот номер будет отправлена ссылка на оплату Kaspi и детали доставки.
          </p>
        </div>

        {/* 2. Delivery Method */}
        <div className="bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E6DCD1]">
            <span className="w-5 h-5 rounded-full bg-[#141414] text-white text-[11px] font-semibold flex items-center justify-center">
              2
            </span>
            <h2 className="font-serif text-lg text-[#141414]">Способ доставки</h2>
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

          {/* Delivery Address Field (if not pickup) */}
          {deliveryMethod !== "pickup" && (
            <div className="pt-3 animate-fade-in">
              <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1.5 font-medium">
                Адрес доставки (город, улица, дом, квартира) *
              </label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                rows={2}
                placeholder="г. Кызылорда, мкр. Акмешит, дом 12, кв. 45"
                required
                className="w-full bg-white border border-[#E6DCD1] rounded-xs px-3.5 py-2.5 text-xs focus:outline-none focus:border-black resize-none"
              />
            </div>
          )}

          {/* Optional Comment */}
          <div className="pt-2">
            <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1.5 font-medium">
              Комментарий к заказу (необязательно)
            </label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Удобное время доставки или пожелания по заказу"
              className="w-full bg-white border border-[#E6DCD1] rounded-xs px-3.5 py-2.5 text-xs focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* 3. Kaspi Payment Info */}
        <div className="bg-[#FAF8F5] border border-[#E6DCD1] rounded-xs p-6 space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E6DCD1]">
            <span className="w-5 h-5 rounded-full bg-[#141414] text-white text-[11px] font-semibold flex items-center justify-center">
              3
            </span>
            <h2 className="font-serif text-lg text-[#141414]">Оплата через Kaspi</h2>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 border border-[#E6DCD1] rounded-xs">
            <div className="w-10 h-10 rounded-full bg-[#F23B3B]/10 text-[#F23B3B] flex items-center justify-center font-bold text-sm shrink-0">
              K
            </div>
            <div className="text-xs space-y-0.5">
              <strong className="text-neutral-900 block font-semibold">
                Kaspi Pay / Kaspi QR / Рассрочка
              </strong>
              <p className="text-neutral-500 font-light">
                После нажатия кнопки вы получите реквизиты и прямой QR-код для оплаты в приложении Kaspi.
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#141414] text-white py-4 px-6 text-xs uppercase tracking-widest font-medium hover:bg-[#C5A059] hover:text-black disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
        >
          {submitting ? (
            <span>Оформление заказа...</span>
          ) : (
            <>
              <span>Подтвердить заказ</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-[11px] text-neutral-400 space-y-1 pt-1">
          <div className="flex items-center gap-1.5 text-neutral-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Безопасная оплата через Kaspi</span>
          </div>
          <p>
            Нажимая кнопку, вы подтверждаете согласие на обработку персональных данных для доставки заказа.
          </p>
        </div>
      </div>
    </form>
  );
}
