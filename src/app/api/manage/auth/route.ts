import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyAdminPassword,
  getExpectedSessionToken,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, password } = body;

    const cookieStore = await cookies();

    if (action === "logout") {
      cookieStore.delete(ADMIN_COOKIE_NAME);
      return NextResponse.json({ success: true });
    }

    if (action === "login") {
      // Brute-force protection: max 5 login attempts per 15 minutes
      const clientIp = getClientIp(req);
      const rateCheck = checkRateLimit(`auth_${clientIp}`, {
        intervalMs: 15 * 60 * 1000,
        maxRequests: 5,
      });

      if (!rateCheck.isAllowed) {
        return NextResponse.json(
          {
            error:
              "Слишком много неверных попыток входа. Пожалуйста, подождите 15 минут.",
          },
          { status: 429 }
        );
      }

      if (!password || !verifyAdminPassword(password)) {
        return NextResponse.json(
          { error: "Неверный пароль владельца бутика" },
          { status: 401 }
        );
      }

      const token = getExpectedSessionToken();

      cookieStore.set(ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days session
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Недопустимое действие" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка сервера при авторизации" },
      { status: 500 }
    );
  }
}
