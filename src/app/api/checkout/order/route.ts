import { NextRequest, NextResponse } from "next/server";
import { checkoutFormSchema } from "@/lib/validations/checkout";
import { getShippingCost } from "@/lib/delivery";
import { MOCK_PRODUCTS } from "@/data/mock-products";
import { formatPhoneNumber } from "@/lib/utils";
import { createWhatsAppOrderLink } from "@/lib/whatsapp";

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

    // Offline / Local JSON Fallback (Instant, Zero Supabase dependency)
    for (const item of data.items) {
      const mockProd = MOCK_PRODUCTS.find(
        (p) => p.id === item.productId || p.slug === item.productId
      );
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

    const whatsappUrl = createWhatsAppOrderLink({
      customerName: data.customerName,
      customerPhone: formattedPhone,
      deliveryMethod: data.deliveryMethod,
      cityAddress: data.deliveryAddress || "Самовывоз",
      comment: data.comment,
      items: validatedItems.map((vi) => ({
        title: vi.productName,
        size: vi.size,
        color: vi.color,
        quantity: vi.quantity,
        price: vi.price,
      })),
      totalAmount,
    });

    return NextResponse.json({
      success: true,
      orderId: `order-${Date.now()}`,
      orderNumber,
      subtotal: serverSubtotal,
      shippingCost,
      totalAmount,
      whatsappUrl,
      paymentStatus: "PENDING",
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Ошибка при создании заказа" },
      { status: 500 }
    );
  }
}
