import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: "Требуется авторизация владельца" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!token || token.includes("placeholder-")) {
    return NextResponse.json({
      error: "TELEGRAM_BOT_TOKEN не настроен в .env.local",
    }, { status: 400 });
  }

  if (!siteUrl || siteUrl.includes("localhost")) {
    return NextResponse.json({
      warning: "Сайт запущен на localhost. Для работы вебхука Telegram требуется публичный URL (например, при деплое на Vercel или через ngrok).",
      siteUrl,
    });
  }

  const webhookUrl = `${siteUrl}/api/telegram/webhook`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: secret && !secret.includes("placeholder-") ? secret : undefined,
        allowed_updates: ["message", "callback_query"],
      }),
    });

    const data = await res.json();
    return NextResponse.json({
      success: res.ok,
      telegramResponse: data,
      webhookUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
