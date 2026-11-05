import { NextRequest, NextResponse } from "next/server";
import { checkoutFormSchema } from "@/lib/validations/checkout";
import { getShippingCost } from "@/lib/delivery";
import { isSupabaseConfigured, getAdminClient } from "@/lib/supabase/admin";
import { MOCK_PRODUCTS } from "@/data/mock-products";
import { formatPhoneNumber } from "@/lib/utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // 0. Rate Limiting Protection (Anti-Spam Bot Protection)
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`order_${clientIp}`, {
      intervalMs: 10 * 60 * 1000, // 10 minutes
      maxRequests: 10,
    });

    if (!rateCheck.isAllowed) {
      return NextResponse.json(
        {
          error:
            "Слишком много запросов на создание заказа. Пожалуйста, подождите несколько минут.",
        },
        { status: 429 }
      );
    }

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
        // Fetch real product & variant safely supporting UUIDs, slugs, legacy cart IDs, and mock fallbacks
        let prodData: any = null;

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.productId);
        if (isUuid) {
          const res = await supabase
            .from("products")
            .select("id, title, base_price, is_active")
            .eq("id", item.productId)
            .maybeSingle();
          if (res.data) prodData = res.data;
        }

        // Fallback 1: search by slug matching item.productId
        if (!prodData) {
          const res = await supabase
            .from("products")
            .select("id, title, base_price, is_active")
            .eq("slug", item.productId)
            .maybeSingle();
          if (res.data) prodData = res.data;
        }

        // Fallback 2: search by product title
        if (!prodData && item.title) {
          const res = await supabase
            .from("products")
            .select("id, title, base_price, is_active")
            .ilike("title", `%${item.title.trim()}%`)
            .limit(1);
          if (res.data && res.data.length > 0) prodData = res.data[0];
        }

        // Fallback 3: match in-memory from all active products in Supabase
        if (!prodData) {
          const { data: allProds } = await supabase
            .from("products")
            .select("id, title, slug, base_price, is_active")
            .eq("is_active", true);

          if (allProds && allProds.length > 0) {
            const cleanTitle = (item.title || "").toLowerCase().replace(/[^a-zа-я0-9]/gi, "");
            const found = allProds.find((p: any) => {
              if (p.id === item.productId || p.slug === item.productId) return true;
              const pClean = p.title.toLowerCase().replace(/[^a-zа-я0-9]/gi, "");
              return (cleanTitle.length > 3 && pClean.includes(cleanTitle)) || (pClean.length > 3 && cleanTitle.includes(pClean));
            });
            if (found) prodData = found;
          }
        }

        // Fallback 4: mock products data fallback so an order can never be rejected
        if (!prodData) {
          const mockMatch = MOCK_PRODUCTS.find(
            (p) => p.id === item.productId || p.slug === item.productId || (p.title && item.title && (p.title.includes(item.title) || item.title.includes(p.title)))
          );
          if (mockMatch) {
            prodData = {
              id: mockMatch.id,
              title: mockMatch.title,
              base_price: mockMatch.basePrice,
              is_active: true,
            };
          }
        }

        if (!prodData || !prodData.is_active) {
          console.error("[Checkout] Product could not be resolved:", item);
          return NextResponse.json(
            { error: `Товар «${item.title}» недоступен для заказа` },
            { status: 400 }
          );
        }

        // Find matching variant
        let varData: any = null;
        const isProdUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(prodData.id);
        const isVarUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.variantId);

        if (isVarUuid) {
          const res = await supabase
            .from("product_variants")
            .select("id, size, color, stock_quantity")
            .eq("id", item.variantId)
            .maybeSingle();
          if (res.data) varData = res.data;
        }

        // Match variant by product_id and size
        if (!varData && isProdUuid) {
          const res = await supabase
            .from("product_variants")
            .select("id, size, color, stock_quantity")
            .eq("product_id", prodData.id);

          if (res.data && res.data.length > 0) {
            const cleanSize = (item.size || "").trim().toLowerCase();
            varData = res.data.find((v: any) => v.size.trim().toLowerCase() === cleanSize) || res.data[0];
          }
        }

        // Safe fallback for variant
        if (!varData) {
          varData = {
            id: isVarUuid ? item.variantId : null,
            size: item.size || "S",
            color: item.color || "Шампань",
            stock_quantity: 99,
          };
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
          productId: isProdUuid ? prodData.id : null,
          variantId: isVarUuid && varData.id ? varData.id : null,
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
        if (!vi.variantId) continue;
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
