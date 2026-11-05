import { NextRequest, NextResponse } from "next/server";
import { kaspiProvider } from "@/lib/payments/kaspi";
import { isSupabaseConfigured, getAdminClient } from "@/lib/supabase/admin";
import { getTelegramChatIds } from "@/lib/telegram/bot";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const verification = await kaspiProvider.verifyPayment(body);

    if (!verification.isVerified) {
      console.warn("[Kaspi Webhook] Signature verification failed:", body);
      return NextResponse.json({ error: "Неверная подпись платежа" }, { status: 400 });
    }

    const { orderNumber, transactionId, amount } = verification;

    if (isSupabaseConfigured()) {
      const supabase = getAdminClient() as any;

      // Update order to PAID
      const { data: order } = await supabase
        .from("orders")
        .select("id")
        .eq("order_number", orderNumber)
        .single();

      if (order) {
        await supabase
          .from("orders")
          .update({ payment_status: "PAID", updated_at: new Date().toISOString() })
          .eq("id", order.id);

        await supabase.from("payment_transactions").insert({
          order_id: order.id,
          provider: "kaspi",
          transaction_id: transactionId,
          amount,
          status: "PAID",
          payload: body,
        });

        // Notify owners via Telegram
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatIds = getTelegramChatIds();
        if (token && chatIds.length > 0 && !token.includes("placeholder-")) {
          for (const cid of chatIds) {
            try {
              await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: cid,
                  text: `✅ <b>Оплата по Kaspi Pay подтверждена!</b>\nЗаказ: #${orderNumber}\nСумма: ${amount.toLocaleString("ru-KZ")} ₸\nID транзакции: <code>${transactionId}</code>`,
                  parse_mode: "HTML",
                }),
              });
            } catch (err) {
              console.warn(`[Telegram] Kaspi payment notification error for ${cid}:`, err);
            }
          }
        }
      }
    }

    return NextResponse.json({ status: "OK", orderNumber });
  } catch (error: any) {
    console.error("[Kaspi Webhook] Error:", error);
    return NextResponse.json({ error: "Ошибка обработки платежа" }, { status: 500 });
  }
}
