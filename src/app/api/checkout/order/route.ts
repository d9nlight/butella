import { NextRequest, NextResponse } from "next/server";
import { checkoutFormSchema } from "@/lib/validations/checkout";
import { getShippingCost } from "@/lib/delivery";
import { isSupabaseConfigured, getAdminClient } from "@/lib/supabase/admin";
import { MOCK_PRODUCTS } from "@/data/mock-products";
import { formatPhoneNumber } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // 1. Zod Validation
    const validation = checkoutFormSchema.safeParse(rawBody);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Ошибка в данных заказа";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = validation.data;
    const formattedPhone = formatPhoneNumber(data.customerPhone);

    // 2. Server-Side Price & Stock Verification (Never trust prices from client)
    let serverSubtotal = 0;
    const validatedItems: {
      productId: string;
      variantId: string;
      productName: string;
      size: string;
      color: string;
      price: number;
      quantity: number;
      imageUrl?: string;
    }[] = [];

    if (isSupabaseConfigured()) {
      const supabase = getAdminClient() as any;

      for (const item of data.items) {
        // Fetch real product & variant
        const { data: prodData, error: prodErr } = await supabase
          .from("products")
          .select("id, title, base_price, is_active")
          .eq("id", item.productId)
          .single();

        if (prodErr || !prodData || !prodData.is_active) {
          return NextResponse.json(
            { error: `Товар «${item.title}» недоступен для заказа` },
            { status: 400 }
          );
        }

        const { data: varData, error: varErr } = await supabase
          .from("product_variants")
          .select("id, size, color, stock_quantity")
          .eq("id", item.variantId)
          .single();

        if (varErr || !varData) {
          return NextResponse.json(
            { error: `Размер для товара «${prodData.title}» не найден` },
            { status: 400 }
          );
        }

        if (varData.stock_quantity < item.quantity) {
          return NextResponse.json(
            {
              error: `Товар «${prodData.title}» (${varData.size}) доступен в количестве всего ${varData.stock_quantity} шт.`,
            },
            { status: 400 }
          );
        }

        const realPrice = prodData.base_price;
        serverSubtotal += realPrice * item.quantity;

        validatedItems.push({
          productId: prodData.id,
          variantId: varData.id,
          productName: prodData.title,
          size: varData.size,
          color: varData.color,
          price: realPrice,
          quantity: item.quantity,
          imageUrl: item.image,
        });
      }

      // Calculate delivery and total
      const shippingCost = getShippingCost(data.deliveryMethod);
      const totalAmount = serverSubtotal + shippingCost;
      const orderNumber = `BUT-${Math.floor(100000 + Math.random() * 900000)}`;

      // Insert Order into Supabase
      const { data: newOrder, error: orderErr } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_name: data.customerName,
          customer_phone: formattedPhone,
          delivery_method: data.deliveryMethod,
          delivery_address: data.deliveryAddress || null,
          comment: data.comment || null,
          subtotal: serverSubtotal,
          shipping_cost: shippingCost,
          total_amount: totalAmount,
          payment_status: "PENDING",
          order_status: "NEW",
        })
        .select("id")
        .single();

      if (orderErr || !newOrder) {
        throw new Error(`Ошибка сохранения заказа: ${orderErr?.message}`);
      }

      const orderId = newOrder.id;

      // Insert Order Items
      const orderItemInserts = validatedItems.map((vi) => ({
        order_id: orderId,
        product_id: vi.productId,
        variant_id: vi.variantId,
        product_name: vi.productName,
        size: vi.size,
        color: vi.color,
        price: vi.price,
        quantity: vi.quantity,
        image_url: vi.imageUrl || null,
      }));

      await supabase.from("order_items").insert(orderItemInserts);

      // Decrement stock in product_variants
      for (const vi of validatedItems) {
        const { data: currentVar } = await supabase
          .from("product_variants")
          .select("stock_quantity")
          .eq("id", vi.variantId)
          .single();

        if (currentVar) {
          const updatedQty = Math.max(0, currentVar.stock_quantity - vi.quantity);
          await supabase
            .from("product_variants")
            .update({ stock_quantity: updatedQty })
            .eq("id", vi.variantId);
        }
      }

      // Insert Initial Kaspi Payment Transaction
      await supabase.from("payment_transactions").insert({
        order_id: orderId,
        provider: "kaspi",
        amount: totalAmount,
        status: "PENDING",
      });

      // Try sending Telegram notification if token exists (non-blocking)
      try {
        const { notifyNewOrder } = await import("@/lib/telegram/bot");
        await notifyNewOrder({
          orderNumber,
          customerName: data.customerName,
          customerPhone: formattedPhone,
          deliveryMethod: data.deliveryMethod,
          deliveryAddress: data.deliveryAddress,
          comment: data.comment,
          totalAmount,
          items: validatedItems,
        });
      } catch (tgErr) {
        console.warn("Telegram notification attempt:", tgErr);
      }

      return NextResponse.json({
        success: true,
        orderId,
        orderNumber,
        subtotal: serverSubtotal,
        shippingCost,
        totalAmount,
        paymentStatus: "PENDING",
      });
    } else {
      // Offline / Local Development Fallback
      for (const item of data.items) {
        const mockProd = MOCK_PRODUCTS.find((p) => p.id === item.productId || p.slug === item.productId);
        const realPrice = mockProd ? mockProd.basePrice : 25000;
        serverSubtotal += realPrice * item.quantity;

        validatedItems.push({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.title,
          size: item.size,
          color: item.color,
          price: realPrice,
          quantity: item.quantity,
          imageUrl: item.image,
        });
      }

      const shippingCost = getShippingCost(data.deliveryMethod);
      const totalAmount = serverSubtotal + shippingCost;
      const orderNumber = `BUT-${Math.floor(100000 + Math.random() * 900000)}`;

      // Try sending Telegram notification if configured
      try {
        const { notifyNewOrder } = await import("@/lib/telegram/bot");
        await notifyNewOrder({
          orderNumber,
          customerName: data.customerName,
          customerPhone: formattedPhone,
          deliveryMethod: data.deliveryMethod,
          deliveryAddress: data.deliveryAddress,
          comment: data.comment,
          totalAmount,
          items: validatedItems,
        });
      } catch (tgErr) {
        console.warn("Telegram notification attempt:", tgErr);
      }

      return NextResponse.json({
        success: true,
        orderId: `mock-order-${Date.now()}`,
        orderNumber,
        subtotal: serverSubtotal,
        shippingCost,
        totalAmount,
        paymentStatus: "PENDING",
      });
    }
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Ошибка при создании заказа" },
      { status: 500 }
    );
  }
}
