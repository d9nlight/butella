import { PaymentProvider, PaymentInitiationResult, PaymentVerificationResult } from "./types";

export class KaspiPaymentProvider implements PaymentProvider {
  readonly id = "kaspi";
  readonly name = "Kaspi Pay / Kaspi QR";

  async initiatePayment(order: {
    orderNumber: string;
    amount: number;
    customerPhone: string;
  }): Promise<PaymentInitiationResult> {
    const phone = process.env.NEXT_PUBLIC_KASPI_PHONE || "+7 (777) 123-45-67";
    const recipient = process.env.NEXT_PUBLIC_KASPI_RECIPIENT_NAME || "BUTELLA BOUTIQUE";
    const baseUrl = process.env.NEXT_PUBLIC_KASPI_PAY_LINK || "https://kaspi.kz/pay/butella";

    // Build payment URL / deep link
    const payUrl = `${baseUrl}?order=${order.orderNumber}&amount=${order.amount}`;

    return {
      paymentId: `kaspi-${order.orderNumber}`,
      orderNumber: order.orderNumber,
      amount: order.amount,
      status: "PENDING",
      provider: this.id,
      instructions: {
        recipientName: recipient,
        recipientPhone: phone,
        payUrl,
        qrData: `kaspi://pay?merchant=${encodeURIComponent(recipient)}&order=${order.orderNumber}&amount=${order.amount}`,
        referenceCode: order.orderNumber,
        notes: [
          "Откройте приложение Kaspi.kz на телефоне",
          "Перейдите в раздел «Платежи» или «Переводы»",
          `Укажите номер ${phone} (${recipient})`,
          `В комментарии ОБЯЗАТЕЛЬНО укажите номер заказа: ${order.orderNumber}`,
        ],
      },
    };
  }

  async verifyPayment(payload: any): Promise<PaymentVerificationResult> {
    // If webhook signature / token is configured for official Kaspi Pay merchant API
    const merchantSecret = process.env.KASPI_MERCHANT_SECRET;

    if (merchantSecret && payload.signature) {
      // Server-side signature validation
      const isValidSignature = payload.signature === merchantSecret;
      return {
        isVerified: isValidSignature,
        transactionId: payload.txn_id,
        orderNumber: payload.order_id,
        amount: Number(payload.amount),
        message: isValidSignature ? "Kaspi merchant signature verified" : "Invalid Kaspi signature",
      };
    }

    // Default safe workflow: Payment is verified server-side when the store owner
    // taps the verified confirmation button in Telegram or via the /manage panel.
    return {
      isVerified: Boolean(payload.verifiedByOwner),
      transactionId: payload.transactionId || `manual-${Date.now()}`,
      orderNumber: payload.orderNumber,
      amount: payload.amount,
      message: "Owner verified Kaspi payment receipt",
    };
  }
}

export const kaspiProvider = new KaspiPaymentProvider();
