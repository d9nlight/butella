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
export const KASPI_RECIPIENT_NAME = "BUTELLA BOUTIQUE";

/**
 * Builds the official Kaspi Pay / Transfer URL and payload.
 */
export function buildKaspiPaymentPayload(options: KaspiQrOptions) {
  const phone = options.phone || KASPI_RECIPIENT_PHONE;
  const recipient = options.recipientName || KASPI_RECIPIENT_NAME;
  const rawPhone = phone.replace(/\D/g, "") || KASPI_RAW_PHONE;

  const siteUrl =
    options.siteUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  // Mobile order payment URL (when scanned by any smartphone camera, opens this exact order on mobile)
  const orderMobileUrl = `${siteUrl}/checkout/pay?orderNumber=${encodeURIComponent(options.orderNumber)}&amount=${options.amount}`;

  // Direct Kaspi mobile link
  const kaspiAppUrl = "https://kaspi.kz";

  // Check if official merchant link is provided (and not a dummy placeholder)
  const configuredPayLink = options.kaspiPayLink || process.env.NEXT_PUBLIC_KASPI_PAY_LINK;
  const hasRealMerchantLink =
    configuredPayLink &&
    !configuredPayLink.includes("/pay/butella") &&
    configuredPayLink.startsWith("https://kaspi.kz/pay/");

  const webUrl = hasRealMerchantLink
    ? `${configuredPayLink}?order=${encodeURIComponent(options.orderNumber)}&amount=${options.amount}`
    : orderMobileUrl;

  // Kazakhstan Bank Transfer Standard QR text payload (ST00012)
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
    kaspiAppUrl,
    orderMobileUrl,
    standardQrPayload,
    // When camera scans QR, it opens the mobile payment page with 1-click copy & Kaspi launch
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
