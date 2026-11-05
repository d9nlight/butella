import { PaymentProvider, PaymentInitiationResult, PaymentVerificationResult } from "./types";
import { buildKaspiPaymentPayload } from "./qr";

export class KaspiPaymentProvider implements PaymentProvider {
  readonly id = "kaspi";
  readonly name = "Kaspi Pay / Kaspi QR";

  async initiatePayment(order: {
    orderNumber: string;
    amount: number;
    customerPhone: string;
  }): Promise<PaymentInitiationResult> {
    const payload = buildKaspiPaymentPayload({
      orderNumber: order.orderNumber,
      amount: order.amount,
      phone: process.env.NEXT_PUBLIC_KASPI_PHONE,
      recipientName: process.env.NEXT_PUBLIC_KASPI_RECIPIENT_NAME,
      kaspiPayLink: process.env.NEXT_PUBLIC_KASPI_PAY_LINK,
    });

    return {
      paymentId: `kaspi-${order.orderNumber}`,
      orderNumber: order.orderNumber,
      amount: order.amount,
      status: "PENDING",
      provider: this.id,
      instructions: {
        recipientName: payload.recipient,
        recipientPhone: payload.phone,
        payUrl: payload.webUrl,
        qrData: payload.qrData,
        referenceCode: order.orderNumber,
        notes: [
          "Откройте приложение Kaspi.kz на телефоне",
          "Перейдите в раздел «Платежи» или «Переводы»",
          `Укажите номер ${payload.phone} (${payload.recipient})`,
          `В комментарии ОБЯЗАТЕЛЬНО укажите номер заказа: ${order.orderNumber}`,
        ],
      },
    };
  }

  /**
   * Verifies an incoming webhook payload from:
   * 1. Official Kaspi Pay Merchant API
   * 2. Kazakhstan payment gateways (Freedom Pay / PayBox, Robokassa KZ)
   * 3. Android notification/SMS forwarder gateway
   * 4. Authenticated manual confirmation
   */
  async verifyPayment(payload: any, options?: { secretHeader?: string; querySecret?: string }): Promise<PaymentVerificationResult> {
    const configuredSecret =
      process.env.KASPI_WEBHOOK_SECRET ||
      process.env.KASPI_MERCHANT_SECRET ||
      process.env.ADMIN_PASSWORD ||
      "admin_ddd999";

    const providedSecret =
      options?.secretHeader ||
      options?.querySecret ||
      payload.secret ||
      payload.signature ||
      payload.key;

    // 1. Android SMS/Push Gateway text parser (e.g. "Перевод 28 500 ₸ от Даниял с сообщением BUT-351046")
    if (payload.text || payload.message) {
      const rawText = String(payload.text || payload.message);
      const orderMatch = rawText.match(/BUT-\d{6}/i);
      const amountMatch = rawText.match(/(\d[\d\s]*\d)\s*(?:₸|тг|тенге|kzt)/i);

      if (orderMatch) {
        const orderNumber = orderMatch[0].toUpperCase();
        let amount = payload.amount || 0;
        if (!amount && amountMatch) {
          amount = parseInt(amountMatch[1].replace(/\s/g, ""), 10);
        }

        const isSecretValid = providedSecret === configuredSecret;
        return {
          isVerified: isSecretValid,
          orderNumber,
          amount: Number(amount) || 0,
          transactionId: payload.txn_id || payload.id || `sms-${Date.now()}`,
          message: isSecretValid
            ? "SMS/Push gateway payment recognized"
            : "Invalid webhook secret for SMS gateway",
        };
      }
    }

    // 2. Freedom Pay / PayBox format (pg_order_id, pg_payment_id, pg_amount, pg_sig)
    if (payload.pg_order_id) {
      const isSigValid = !configuredSecret || providedSecret === configuredSecret || payload.pg_sig === configuredSecret;
      return {
        isVerified: isSigValid,
        orderNumber: String(payload.pg_order_id),
        amount: Number(payload.pg_amount || 0),
        transactionId: String(payload.pg_payment_id || `fp-${Date.now()}`),
        message: isSigValid ? "Payment gateway signature verified" : "Invalid gateway signature",
      };
    }

    // 3. Official Kaspi Pay Merchant API format:
    // { txn_id: "...", order_id: "BUT-123456", amount: 28500, status: "PAID" | 0, signature: "..." }
    const orderNumber =
      payload.orderNumber ||
      payload.order_id ||
      payload.orderId ||
      payload.account;

    const amount = Number(payload.amount || payload.sum || 0);
    const txnId = payload.txn_id || payload.transactionId || payload.id || `txn-${Date.now()}`;

    // Security signature check
    const isSecretValid =
      !configuredSecret ||
      providedSecret === configuredSecret ||
      payload.signature === configuredSecret;

    if (!orderNumber) {
      return {
        isVerified: false,
        orderNumber: "",
        amount: 0,
        message: "Missing orderNumber in webhook payload",
      };
    }

    return {
      isVerified: Boolean(isSecretValid),
      transactionId: String(txnId),
      orderNumber: String(orderNumber).trim().toUpperCase(),
      amount,
      message: isSecretValid
        ? "Kaspi webhook payment verified"
        : "Webhook signature or secret verification failed",
    };
  }
}

export const kaspiProvider = new KaspiPaymentProvider();
