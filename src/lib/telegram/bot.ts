/**
 * Telegram Bot Notification Service for BUTELLA Boutique
 */

interface NewOrderNotificationData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryMethod: string;
  deliveryAddress?: string;
  comment?: string;
  totalAmount: number;
  items: {
    productName: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
  }[];
}

export async function notifyNewOrder(data: NewOrderNotificationData): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_OWNER_CHAT_ID;

  if (!token || !chatId || token.includes("placeholder-") || chatId === "000000000") {
    console.log("[Telegram] Mock Notification: Order created", data.orderNumber);
    return false;
  }

  const deliveryNames: Record<string, string> = {
    pickup: "Самовывоз из бутика (Кызылорда, ул. Абая 45)",
    local: "Курьер по Кызылорде",
    kazakhstan: "Доставка по Казахстану",
  };

  const deliveryTitle = deliveryNames[data.deliveryMethod] || data.deliveryMethod;

  const itemsList = data.items
    .map(
      (item, idx) =>
        `${idx + 1}. <b>${item.productName}</b>\n   Размер: <b>${item.size}</b> | Цвет: ${item.color}\n   ${item.quantity} шт. × ${item.price.toLocaleString("ru-KZ")} ₸`
    )
    .join("\n\n");

  const messageText = `
🛍 <b>НОВЫЙ ЗАКАЗ #${data.orderNumber}</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Покупатель:</b> ${data.customerName}
📞 <b>Телефон:</b> ${data.customerPhone}

🚚 <b>Способ доставки:</b> ${deliveryTitle}
${data.deliveryAddress ? `📍 <b>Адрес:</b> ${data.deliveryAddress}\n` : ""}${data.comment ? `💬 <b>Комментарий:</b> ${data.comment}\n` : ""}
📦 <b>Товары:</b>
${itemsList}

━━━━━━━━━━━━━━━━━━
💰 <b>ИТОГО К ОПЛАТЕ:</b> <b>${data.totalAmount.toLocaleString("ru-KZ")} ₸</b>
💳 <b>Оплата:</b> Kaspi (Ожидает подтверждения)
`.trim();

  // Inline buttons for owner to control order status from Telegram
  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: "✅ Оплата получена",
          callback_data: `pay_${data.orderNumber}`,
        },
        {
          text: "📦 В сборку",
          callback_data: `proc_${data.orderNumber}`,
        },
      ],
      [
        {
          text: "🚚 Отправлен",
          callback_data: `ship_${data.orderNumber}`,
        },
        {
          text: "❌ Отменить",
          callback_data: `cancel_${data.orderNumber}`,
        },
      ],
    ],
  };

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: "HTML",
        reply_markup: inlineKeyboard,
      }),
    });

    return res.ok;
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
    return false;
  }
}
