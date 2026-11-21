import { formatPrice } from "./utils";

export const WHATSAPP_PHONE = "77779418188";
export const WHATSAPP_DISPLAY_PHONE = "+7 (777) 941-81-88";

export interface WhatsAppOrderItem {
  title: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export interface WhatsAppOrderData {
  customerName: string;
  customerPhone?: string;
  deliveryMethod: string;
  cityAddress?: string;
  comment?: string;
  items: WhatsAppOrderItem[];
  totalAmount: number;
}

/**
 * Creates a direct WhatsApp click-to-chat URL with a pre-filled, elegant order message.
 */
export function createWhatsAppOrderLink(data: WhatsAppOrderData): string {
  const deliveryTitles: Record<string, string> = {
    pickup: "Самовывоз из бутика (г. Кызылорда, ул. Абая 45)",
    local: "Курьер по Кызылорде",
    kazakhstan: "Доставка по Казахстану",
  };

  const deliveryName = deliveryTitles[data.deliveryMethod] || data.deliveryMethod;

  const itemsList = data.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.title}*\n   Размер: *${item.size}* | Цвет: ${item.color}\n   ${item.quantity} шт. × ${formatPrice(item.price)}`
    )
    .join("\n\n");

  const lines = [
    "Здравствуйте! Хочу оформить заказ в бутик BUTELLA ✨",
    "",
    "🛍 *Товары в заказе:*",
    itemsList,
    "",
    "━━━━━━━━━━━━━━━━━━",
    `💰 *ИТОГО К ОПЛАТЕ:* *${formatPrice(data.totalAmount)}*`,
    "━━━━━━━━━━━━━━━━━━",
    "",
    `👤 *Имя:* ${data.customerName}`,
  ];

  if (data.customerPhone && data.customerPhone.trim()) {
    lines.push(`📞 *Телефон:* ${data.customerPhone.trim()}`);
  }

  lines.push(`🚚 *Способ получения:* ${deliveryName}`);

  if (data.cityAddress && data.cityAddress.trim()) {
    lines.push(`📍 *Город / Адрес:* ${data.cityAddress.trim()}`);
  }

  if (data.comment && data.comment.trim()) {
    lines.push(`💬 *Комментарий:* ${data.comment.trim()}`);
  }

  const message = lines.join("\n");
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

/**
 * Creates a fast one-click direct WhatsApp link for an individual product.
 */
export function createWhatsAppProductLink(data: {
  title: string;
  size?: string;
  color?: string;
  price?: number;
}): string {
  const lines = [
    "Здравствуйте! Хочу заказать или примерить в бутике BUTELLA ✨",
    "",
    `👗 *Модель:* ${data.title}`,
  ];

  if (data.size) lines.push(`📏 *Размер:* ${data.size}`);
  if (data.color) lines.push(`🎨 *Цвет:* ${data.color}`);
  if (data.price) lines.push(`💰 *Цена:* ${formatPrice(data.price)}`);

  lines.push("", "Подскажите, есть ли в наличии?");

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(lines.join("\n"))}`;
}
