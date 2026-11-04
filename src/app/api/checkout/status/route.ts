import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, getAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber");

  if (!orderNumber) {
    return NextResponse.json({ error: "Номер заказа не указан" }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = getAdminClient() as any;
      const { data, error } = await supabase
        .from("orders")
        .select("payment_status, order_status")
        .eq("order_number", orderNumber)
        .single();

      if (error || !data) {
        return NextResponse.json({
          orderNumber,
          paymentStatus: "PENDING",
          orderStatus: "NEW",
        });
      }

      return NextResponse.json({
        orderNumber,
        paymentStatus: data.payment_status,
        orderStatus: data.order_status,
      });
    } catch {
      return NextResponse.json({
        orderNumber,
        paymentStatus: "PENDING",
        orderStatus: "NEW",
      });
    }
  }

  // Local development fallback
  return NextResponse.json({
    orderNumber,
    paymentStatus: "PENDING",
    orderStatus: "NEW",
  });
}
