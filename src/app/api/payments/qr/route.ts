import { NextRequest, NextResponse } from "next/server";
import { buildKaspiPaymentPayload, generateKaspiQrSvg } from "@/lib/payments/qr";
import { isSupabaseConfigured, getAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const orderNumber = searchParams.get("orderNumber") || "BUT-000000";
    let amount = Number(searchParams.get("amount") || 0);

    // If amount is not passed in query, attempt to resolve from DB
    if ((!amount || amount <= 0) && isSupabaseConfigured() && orderNumber !== "BUT-000000") {
      try {
        const supabase = getAdminClient() as any;
        const { data } = await supabase
          .from("orders")
          .select("total_amount")
          .eq("order_number", orderNumber)
          .maybeSingle();

        if (data && data.total_amount) {
          amount = data.total_amount;
        }
      } catch {
        // Fallback to default
      }
    }

    const payload = buildKaspiPaymentPayload({
      orderNumber,
      amount,
    });

    const svg = await generateKaspiQrSvg(payload.qrData);

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("[QR Generation Error]", error);
    return new NextResponse(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="10" y="100" fill="red">QR Error</text></svg>`,
      {
        status: 500,
        headers: { "Content-Type": "image/svg+xml" },
      }
    );
  }
}
