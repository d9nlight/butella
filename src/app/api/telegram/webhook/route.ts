import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, getAdminClient } from "@/lib/supabase/admin";
import {
  answerCallbackQuery,
  updateTelegramMessage,
  getOrderKeyboard,
} from "@/lib/telegram/bot";

export async function POST(req: NextRequest) {
  try {
    // 1. Security Header Check (if secret is configured)
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    const incomingSecret = req.headers.get("x-telegram-bot-api-secret-token");

    if (
      webhookSecret &&
      !webhookSecret.includes("placeholder-") &&
      incomingSecret !== webhookSecret
    ) {
      console.warn("[Telegram Webhook] Unauthorized request rejected.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const update = await req.json();

    // 2. Handle Button Callback Queries
    if (update.callback_query) {
      const cq = update.callback_query;
      const callbackId = cq.id;
      const senderId = cq.from.id.toString();
      const ownerChatId = process.env.TELEGRAM_OWNER_CHAT_ID;
      const data = cq.data as string;
      const message = cq.message;

      // Verify that the action was clicked by the authorized owner
      if (ownerChatId && !ownerChatId.startsWith("000") && senderId !== ownerChatId) {
        await answerCallbackQuery(callbackId, "Доступ запрещен. Только владелец бутика может управлять заказами.", true);
        return NextResponse.json({ ok: true });
      }

      const [action, orderNumber] = data.split("_");

      if (!orderNumber || action === "info") {
        await answerCallbackQuery(callbackId, "Информация о заказе актуальна.");
        return NextResponse.json({ ok: true });
      }

      let toastText = "";
      let newPaymentStatus = "PENDING";
      let newOrderStatus = "NEW";

      if (isSupabaseConfigured()) {
        const supabase = getAdminClient() as any;

        // Fetch current order state
        const { data: order, error: fetchErr } = await supabase
          .from("orders")
          .select("id, payment_status, order_status, total_amount, customer_name")
          .eq("order_number", orderNumber)
          .single();

        if (fetchErr || !order) {
          await answerCallbackQuery(callbackId, `Заказ ${orderNumber} не найден в базе данных.`, true);
          return NextResponse.json({ ok: true });
        }

        newPaymentStatus = order.payment_status;
        newOrderStatus = order.order_status;

        if (action === "pay") {
          newPaymentStatus = "PAID";
          await supabase
            .from("orders")
            .update({ payment_status: "PAID", updated_at: new Date().toISOString() })
            .eq("order_number", orderNumber);

          await supabase
            .from("payment_transactions")
            .update({ status: "PAID" })
            .eq("order_id", order.id);

          toastText = `✅ Оплата заказа #${orderNumber} подтверждена!`;
        } else if (action === "proc") {
          newOrderStatus = "PROCESSING";
          await supabase
            .from("orders")
            .update({ order_status: "PROCESSING", updated_at: new Date().toISOString() })
            .eq("order_number", orderNumber);

          toastText = `📦 Заказ #${orderNumber} передан на сборку`;
        } else if (action === "ship") {
          newOrderStatus = "SHIPPED";
          await supabase
            .from("orders")
            .update({ order_status: "SHIPPED", updated_at: new Date().toISOString() })
            .eq("order_number", orderNumber);

          toastText = `🚚 Заказ #${orderNumber} отмечен как отправленный`;
        } else if (action === "done") {
          newOrderStatus = "COMPLETED";
          await supabase
            .from("orders")
            .update({ order_status: "COMPLETED", updated_at: new Date().toISOString() })
            .eq("order_number", orderNumber);

          toastText = `🎉 Заказ #${orderNumber} успешно завершен!`;
        } else if (action === "cancel") {
          newOrderStatus = "CANCELLED";
          await supabase
            .from("orders")
            .update({ order_status: "CANCELLED", updated_at: new Date().toISOString() })
            .eq("order_number", orderNumber);

          // Restore stock in product_variants
          const { data: items } = await supabase
            .from("order_items")
            .select("variant_id, quantity")
            .eq("order_id", order.id);

          if (items) {
            for (const item of items) {
              if (item.variant_id) {
                const { data: v } = await supabase
                  .from("product_variants")
                  .select("stock_quantity")
                  .eq("id", item.variant_id)
                  .single();

                if (v) {
                  await supabase
                    .from("product_variants")
                    .update({ stock_quantity: v.stock_quantity + item.quantity })
                    .eq("id", item.variant_id);
                }
              }
            }
          }

          toastText = `❌ Заказ #${orderNumber} отменен. Остаток возвращен на склад.`;
        }
      } else {
        // Offline / mock mode
        if (action === "pay") {
          newPaymentStatus = "PAID";
          toastText = `✅ Оплата #${orderNumber} подтверждена (Тестовый режим)`;
        } else if (action === "proc") {
          newOrderStatus = "PROCESSING";
          toastText = `📦 Заказ #${orderNumber} в сборке`;
        } else if (action === "ship") {
          newOrderStatus = "SHIPPED";
          toastText = `🚚 Заказ #${orderNumber} отправлен`;
        } else if (action === "done") {
          newOrderStatus = "COMPLETED";
          toastText = `🎉 Заказ #${orderNumber} завершен`;
        } else if (action === "cancel") {
          newOrderStatus = "CANCELLED";
          toastText = `❌ Заказ #${orderNumber} отменен`;
        }
      }

      await answerCallbackQuery(callbackId, toastText);

      // Update the original message text with new badges
      if (message && message.text) {
        let updatedText = message.text;

        const paymentStatusLabels: Record<string, string> = {
          PAID: "🟢 ОПЛАЧЕНО (Kaspi)",
          PENDING: "🟡 Ожидает подтверждения",
        };

        const orderStatusLabels: Record<string, string> = {
          NEW: "🆕 Новый",
          PROCESSING: "📦 В сборке",
          SHIPPED: "🚚 Отправлен клиенту",
          COMPLETED: "🎉 Выполнен",
          CANCELLED: "❌ Отменен",
        };

        // Replace status lines
        updatedText = updatedText.replace(
          /Оплата Kaspi:.*$/m,
          `Оплата Kaspi: ${paymentStatusLabels[newPaymentStatus] || newPaymentStatus}`
        );
        updatedText = updatedText.replace(
          /Статус заказа:.*$/m,
          `Статус заказа: ${orderStatusLabels[newOrderStatus] || newOrderStatus}`
        );

        const newKeyboard = getOrderKeyboard(orderNumber, newPaymentStatus, newOrderStatus);

        await updateTelegramMessage(
          message.chat.id,
          message.message_id,
          updatedText,
          newKeyboard
        );
      }

      return NextResponse.json({ ok: true });
    }

    // 3. Handle Standard Bot Text Messages (e.g. /start, /help)
    if (update.message && update.message.text) {
      const text = update.message.text.trim();
      const chatId = update.message.chat.id;
      const token = process.env.TELEGRAM_BOT_TOKEN;

      if (token && !token.includes("placeholder-")) {
        let reply = "";
        if (text === "/start") {
          reply = `
✨ <b>Добро пожаловать в бот бутика BUTELLA (Кызылорда)!</b>

Сюда будут мгновенно приходить все новые заказы с вашего сайта.
Вы сможете:
• Подтверждать получение оплаты Kaspi в один клик
• Менять статусы сборки и отправки
• Контролировать наличие и остатки

Ваш Chat ID: <code>${chatId}</code>
(Убедитесь, что он указан в переменной <code>TELEGRAM_OWNER_CHAT_ID</code>)
          `.trim();
        } else {
          reply = `Бот бутика BUTELLA активен и ожидает новых заказов с сайта. Для справки введите /start.`;
        }

        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: reply,
            parse_mode: "HTML",
          }),
        });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[Telegram Webhook] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
