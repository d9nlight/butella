import QRCode from "qrcode";

export interface KaspiQrOptions {
  orderNumber: string;
  amount: number;
  phone?: string;
  recipientName?: string;
  kaspiPayLink?: string;
}

/**
 * Builds the official Kaspi Pay / Transfer URL and Deeplink.
 * If NEXT_PUBLIC_KASPI_PAY_LINK is configured (e.g., https://kaspi.kz/pay/butella),
 * it appends order and amount query parameters.
 */
export function buildKaspiPaymentPayload(options: KaspiQrOptions) {
  const phone =
    options.phone ||
    process.env.NEXT_PUBLIC_KASPI_PHONE ||
    "+7 (705) 392-02-88";
  const recipient =
    options.recipientName ||
    process.env.NEXT_PUBLIC_KASPI_RECIPIENT_NAME ||
    "BUTELLA BOUTIQUE";
  const rawPhone = phone.replace(/\D/g, "");

  const basePayLink =
    options.kaspiPayLink ||
    process.env.NEXT_PUBLIC_KASPI_PAY_LINK ||
    "https://kaspi.kz/pay/butella";

  // 1. Web link (opens Kaspi app on mobile or Kaspi.kz web page)
  const webUrl = `${basePayLink}?order=${encodeURIComponent(
    options.orderNumber
  )}&amount=${options.amount}`;

  // 2. Direct mobile app deeplink for iOS and Android
  const mobileDeeplink = `kaspi://pay?merchant=${encodeURIComponent(
    recipient
  )}&order=${encodeURIComponent(
    options.orderNumber
  )}&amount=${options.amount}&phone=${rawPhone}`;

  // 3. Kazakhstan Bank Transfer Standard QR text payload
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
    standardQrPayload,
    // Prefer webUrl for QR so both Kaspi QR scanner and camera scanners open the payment page
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
