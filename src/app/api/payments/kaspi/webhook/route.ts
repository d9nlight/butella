import { NextRequest, NextResponse } from "next/server";
import { kaspiProvider } from "@/lib/payments/kaspi";
import { isSupabaseConfigured, getAdminClient } from "@/lib/supabase/admin";
import { getTelegramChatIds } from "@/lib/telegram/bot";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let body: any = {};

    if (contentType.includes("application/json")) {
      body = await req.json().catch(() => ({}));
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      body = Object.fromEntries(params.entries());
    } else {
      body = await req.json().catch(() => ({}));
    }

    const { searchParams } = new URL(req.url);
    const querySecret = searchParams.get("secret") || undefined;
    const secretHeader =
      req.headers.get("x-kaspi-signature") ||
      req.headers.get("x-webhook-secret") ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      undefined;

    const verification = await kaspiProvider.verifyPayment(body, {
      secretHeader,
      querySecret,
    });

    if (!verification.isVerified) {
      console.warn("[Kaspi Webhook] Verification failed:", { body, error: verification.message });
      return NextResponse.json(
        { error: verification.message || "Неверная подпись или секретный ключ вебхука" },
        { status: 400 }
      );
    }

    const { orderNumber, transactionId, amount } = verification;

    if (isSupabaseConfigured()) {
      const supabase = getAdminClient() as any;

      // Find order in Supabase
      const { data: order, error: fetchErr } = await supabase
        .from("orders")
        .select("id, total_amount, customer_name, payment_status")
        .eq("order_number", orderNumber)
        .maybeSingle();

      if (fetchErr || !order) {
        console.warn(`[Kaspi Webhook] Order #${orderNumber} not found in database.`);
        return NextResponse.json(
          { error: `Заказ #${orderNumber} не найден в базе данных` },
          { status: 404 }
        );
      }

      // Update order to PAID
      await supabase
        .from("orders")
        .update({
          payment_status: "PAID",
          order_status: "PROCESSING",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      // Record in payment_transactions
      await supabase.from("payment_transactions").insert({
        order_id: order.id,
        provider: "kaspi",
        transaction_id: transactionId,
        amount: amount || order.total_amount,
        status: "PAID",
        payload: body,
      });

      // Send Telegram notification to both owners
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatIds = getTelegramChatIds();

      if (token && chatIds.length > 0 && !token.includes("placeholder-")) {
        const finalAmount = (amount || order.total_amount).toLocaleString("ru-KZ");
        const messageText = `✅ <b>Оплата по Kaspi подтверждена!</b>\n\n` +
          `💳 <b>Заказ:</b> #${orderNumber}\n` +
          `👤 <b>Клиент:</b> ${order.customer_name}\n` +
          `💰 <b>Сумма:</b> ${finalAmount} ₸\n` +
          `🆔 <b>Транзакция:</b> <code>${transactionId}</code>\n\n` +
          `<i>Статус заказа в системе автоматически изменен на «Оплачен» и передан на сборку.</i>`;

        for (const cid of chatIds) {
          try {
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: cid,
                text: messageText,
                parse_mode: "HTML",
              }),
            });
          } catch (err) {
            console.warn(`[Telegram] Kaspi notification error for chat ${cid}:`, err);
          }
        }
      }
    }

    return NextResponse.json({
      status: "OK",
      success: true,
      orderNumber,
      transactionId,
      message: "Платеж успешно принят и заказ переведен в статус Оплачен",
    });
  } catch (error: any) {
    console.error("[Kaspi Webhook] Unexpected error:", error);
    return NextResponse.json({ error: "Внутренняя ошибка обработки вебхука" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Support GET health check / ping from payment gateways
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber");

  if (!orderNumber) {
    return NextResponse.json({
      status: "Kaspi Webhook Endpoint Active",
      docs: "Send POST request with JSON or form-urlencoded payload",
    });
  }

  // Allow GET callback if gateway uses GET redirect
  return POST(req);
}
