import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, getAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const orderNumber = searchParams.get("orderNumber");

  if (!orderNumber) {
    return NextResponse.json({ error: "Номер заказа не указан" }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = getAdminClient() as any;
      const { data: order, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          customer_name,
          customer_phone,
          delivery_method,
          delivery_address,
          comment,
          subtotal,
          shipping_cost,
          total_amount,
          payment_status,
          order_status,
          created_at,
          order_items (
            id,
            product_name,
            size,
            color,
            price,
            quantity,
            image_url
          )
        `)
        .eq("order_number", orderNumber)
        .maybeSingle();

      if (error || !order) {
        return NextResponse.json({
          orderNumber,
          paymentStatus: "PENDING",
          orderStatus: "NEW",
          totalAmount: 0,
          customerName: "Покупатель",
        });
      }

      return NextResponse.json({
        orderNumber: order.order_number,
        paymentStatus: order.payment_status,
        orderStatus: order.order_status,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        deliveryMethod: order.delivery_method,
        deliveryAddress: order.delivery_address,
        comment: order.comment,
        subtotal: order.subtotal,
        shippingCost: order.shipping_cost,
        totalAmount: order.total_amount,
        createdAt: order.created_at,
        items: (order.order_items || []).map((item: any) => ({
          id: item.id,
          productName: item.product_name,
          size: item.size,
          color: item.color,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.image_url,
        })),
      });
    } catch (err: any) {
      if (err?.digest === "NEXT_PRERENDER_INTERRUPTED") {
        throw err;
      }
      console.error("[Checkout Status API] Error:", err);
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
    totalAmount: 28500,
    customerName: "Покупатель",
  });
}
