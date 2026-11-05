import { isSupabaseConfigured, getAdminClient } from "@/lib/supabase/admin";

interface OrderNotificationItem {
  productName: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
}

export interface NewOrderNotificationData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryMethod: string;
  deliveryAddress?: string;
  comment?: string;
  totalAmount: number;
  items: OrderNotificationItem[];
}

export function getTelegramChatIds(): string[] {
  const raw = process.env.TELEGRAM_OWNER_CHAT_ID || "";
  return raw
    .split(/[,;\s]+/)
    .map((id) => id.trim())
    .filter((id) => id && id !== "000000000" && !id.includes("placeholder"));
}

/**
 * Sends a rich order notification message to the owner's Telegram with interactive action buttons.
 */
export async function notifyNewOrder(data: NewOrderNotificationData): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = getTelegramChatIds();

  if (!token || chatIds.length === 0 || token.includes("placeholder-")) {
    console.log("[Telegram] Mock Notification: Order created", data.orderNumber);
    return false;
  }

  const deliveryNames: Record<string, string> = {
    pickup: "Самовывоз из бутика (Кызылорда, ADS Plaza 116 бутик)",
    local: "Курьер по Кызылорде (день в день)",
    kazakhstan: "Доставка по Казахстану (Казпочта/CDEK)",
  };

  const deliveryTitle = deliveryNames[data.deliveryMethod] || data.deliveryMethod;

  const itemsList = data.items
    .map(
      (item, idx) =>
        `<b>${idx + 1}. ${item.productName}</b>\n   Размер: <code>${item.size}</code> | Цвет: ${item.color}\n   ${item.quantity} шт. × ${item.price.toLocaleString("ru-KZ")} ₸`
    )
    .join("\n\n");

  const messageText = `
🛍 <b>НОВЫЙ ЗАКАЗ #${data.orderNumber}</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Покупатель:</b> ${data.customerName}
📞 <b>Телефон:</b> <code>${data.customerPhone}</code>

🚚 <b>Доставка:</b> ${deliveryTitle}
${data.deliveryAddress ? `📍 <b>Адрес:</b> ${data.deliveryAddress}\n` : ""}${data.comment ? `💬 <b>Комментарий:</b> ${data.comment}\n` : ""}
📦 <b>Товары в заказе:</b>
${itemsList}

━━━━━━━━━━━━━━━━━━
💰 <b>СУММА:</b> <b>${data.totalAmount.toLocaleString("ru-KZ")} ₸</b>
💳 <b>Оплата Kaspi:</b> 🟡 <i>Ожидает подтверждения</i>
📋 <b>Статус заказа:</b> 🆕 <i>Новый</i>
`.trim();

  const inlineKeyboard = getOrderKeyboard(data.orderNumber, "PENDING", "NEW");

  let successCount = 0;
  for (const cid of chatIds) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: cid,
          text: messageText,
          parse_mode: "HTML",
          reply_markup: inlineKeyboard,
        }),
      });

      if (res.ok) {
        successCount++;
      } else {
        const err = await res.json();
        console.warn(`[Telegram] API error for chat_id ${cid}:`, err);
      }
    } catch (e) {
      console.warn(`[Telegram] Network error for chat_id ${cid}:`, e);
    }
  }

  return successCount > 0;
}

/**
 * Returns inline buttons based on current order and payment status.
 */
export function getOrderKeyboard(
  orderNumber: string,
  paymentStatus: string,
  orderStatus: string
) {
  const isPaid = paymentStatus === "PAID";
  const isCancelled = orderStatus === "CANCELLED";
  const isCompleted = orderStatus === "COMPLETED";

  if (isCancelled) {
    return {
      inline_keyboard: [
        [{ text: "🚫 Заказ отменен", callback_data: `info_${orderNumber}` }],
      ],
    };
  }

  if (isCompleted) {
    return {
      inline_keyboard: [
        [{ text: "✅ Заказ выполнен и закрыт", callback_data: `info_${orderNumber}` }],
      ],
    };
  }

  const buttons = [];

  // Row 1: Payment confirmation
  if (!isPaid) {
    buttons.push([
      {
        text: "✅ Подтвердить оплату Kaspi",
        callback_data: `pay_${orderNumber}`,
      },
    ]);
  }

  // Row 2: Status progression
  const statusRow = [];
  if (orderStatus === "NEW") {
    statusRow.push({
      text: "📦 В сборку",
      callback_data: `proc_${orderNumber}`,
    });
  } else if (orderStatus === "PROCESSING") {
    statusRow.push({
      text: "🚚 Отправлен клиенту",
      callback_data: `ship_${orderNumber}`,
    });
  } else if (orderStatus === "SHIPPED") {
    statusRow.push({
      text: "🎉 Заказ вручен (Выполнен)",
      callback_data: `done_${orderNumber}`,
    });
  }

  if (statusRow.length > 0) {
    buttons.push(statusRow);
  }

  // Row 3: Cancel button
  buttons.push([
    {
      text: "❌ Отменить заказ",
      callback_data: `cancel_${orderNumber}`,
    },
  ]);

  return { inline_keyboard: buttons };
}

/**
 * Sends a popup notification or alert to the Telegram app when a button is clicked.
 */
export async function answerCallbackQuery(
  callbackQueryId: string,
  text: string,
  showAlert: boolean = false
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token.includes("placeholder-")) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
      }),
    });
  } catch (err) {
    console.error("[Telegram] answerCallbackQuery error:", err);
  }
}

/**
 * Updates an existing Telegram message with new status and updated buttons.
 */
export async function updateTelegramMessage(
  chatId: string | number,
  messageId: number,
  newText: string,
  replyMarkup?: any
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token.includes("placeholder-")) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: newText,
        parse_mode: "HTML",
        reply_markup: replyMarkup,
      }),
    });
  } catch (err) {
    console.error("[Telegram] updateTelegramMessage error:", err);
  }
}
