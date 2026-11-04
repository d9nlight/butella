import { DeliveryMethod, DeliveryOption } from "@/types/ecommerce";

/**
 * Returns available delivery methods with prices configured via environment variables.
 */
export function getDeliveryOptions(): DeliveryOption[] {
  const pickupPrice = Number(process.env.NEXT_PUBLIC_SHIPPING_PICKUP_PRICE ?? 0);
  const localPrice = Number(process.env.NEXT_PUBLIC_SHIPPING_LOCAL_PRICE ?? 1500);
  const kazakhstanPrice = Number(process.env.NEXT_PUBLIC_SHIPPING_KAZAKHSTAN_PRICE ?? 2500);

  return [
    {
      id: "pickup",
      title: "Самовывоз из бутика",
      description: "г. Кызылорда, ул. Абая 45 • Ежедневно 10:00–20:00 • Бесплатная примерка",
      price: pickupPrice,
      badge: "Бесплатно",
    },
    {
      id: "local",
      title: "Курьер по Кызылорде",
      description: "Доставка до вашей двери в день заказа с возможностью примерки",
      price: localPrice,
      badge: "День в день",
    },
    {
      id: "kazakhstan",
      title: "Доставка по Казахстану",
      description: "Казпочта или экспресс-служба CDEK в любой город РК (2–4 дня)",
      price: kazakhstanPrice,
      badge: "По всему Казахстану",
    },
  ];
}

/**
 * Calculates shipping cost strictly on the server based on configured rates.
 */
export function getShippingCost(method: DeliveryMethod): number {
  const options = getDeliveryOptions();
  const matched = options.find((opt) => opt.id === method);
  return matched ? matched.price : 0;
}
