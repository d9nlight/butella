import QRCode from "qrcode";

export interface KaspiQrOptions {
  orderNumber: string;
  amount: number;
  phone?: string;
  recipientName?: string;
  kaspiPayLink?: string;
  siteUrl?: string;
}

export const KASPI_RECIPIENT_PHONE = "+7 (705) 392-02-88";
export const KASPI_RAW_PHONE = "77053920288";
export const KASPI_RECIPIENT_NAME = "Butella_fashion (ИП САМЛАУ)";
export const KASPI_OFFICIAL_PAY_LINK = "https://pay.kaspi.kz/pay/kob6gsmr";
export const KASPI_APP_DEEPLINK = "kaspikz://pay.kaspi.kz/pay/kob6gsmr";

/**
 * Builds the official Kaspi Pay / Transfer URL and payload.
 */
export function buildKaspiPaymentPayload(options: KaspiQrOptions) {
  const phone = options.phone || KASPI_RECIPIENT_PHONE;
  const recipient = options.recipientName || KASPI_RECIPIENT_NAME;
  const rawPhone = phone.replace(/\D/g, "") || KASPI_RAW_PHONE;

  const baseWebUrl =
    options.kaspiPayLink ||
    process.env.NEXT_PUBLIC_KASPI_PAY_LINK ||
    KASPI_OFFICIAL_PAY_LINK;

  const webUrl = `${baseWebUrl}?order=${encodeURIComponent(
    options.orderNumber
  )}&amount=${options.amount}`;

  const mobileDeeplink = KASPI_APP_DEEPLINK;
  const kaspiAppUrl = baseWebUrl;

  const siteUrl =
    options.siteUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  const orderMobileUrl = `${siteUrl}/checkout/pay?orderNumber=${encodeURIComponent(
    options.orderNumber
  )}&amount=${options.amount}`;

  // Standard banking QR payload
  const standardQrPayload = [
    `ST00012`,
    `Name=${recipient}`,
    `PersonalAcc=${rawPhone}`,
    `BankName=Kaspi Bank`,
    `Sum=${options.amount}`,
    `Purpose=Оплата заказа ${options.orderNumber}`,
  ].join("|");

  return {
    phone,
    rawPhone,
    recipient,
    webUrl,
    mobileDeeplink,
    kaspiAppUrl,
    orderMobileUrl,
    standardQrPayload,
    // The QR code encodes the official Kaspi Pay point:
    // When scanned by Kaspi.kz app scanner or camera, it directly opens Butella_fashion (ИП САМЛАУ)!
    qrData: webUrl,
  };
}

/**
 * Generates an SVG string of the QR code
 */
export async function generateKaspiQrSvg(data: string): Promise<string> {
  return await QRCode.toString(data, {
    type: "svg",
    margin: 1,
    color: {
      dark: "#141414",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "M",
    width: 280,
  });
}

/**
 * Generates a Data URL (base64 PNG) of the QR code
 */
export async function generateKaspiQrDataUrl(data: string): Promise<string> {
  return await QRCode.toDataURL(data, {
    margin: 1,
    width: 320,
    color: {
      dark: "#141414",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "M",
  });
}
