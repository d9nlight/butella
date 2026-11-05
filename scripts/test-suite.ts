/**
 * BUTELLA — Automated Quality & Security Verification Suite
 * Tests domain rules, data integrity, security validation, and payment workflows.
 */

import { MOCK_PRODUCTS, CATEGORIES } from "../src/data/mock-products";
import { getShippingCost } from "../src/lib/delivery";
import { checkoutFormSchema } from "../src/lib/validations/checkout";
import { verifyAdminPassword, getExpectedSessionToken } from "../src/lib/auth";
import { checkRateLimit } from "../src/lib/rate-limit";
import { kaspiProvider } from "../src/lib/payments/kaspi";
import { buildKaspiPaymentPayload, generateKaspiQrSvg } from "../src/lib/payments/qr";
import { getOrderKeyboard } from "../src/lib/telegram/bot";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log("\n=======================================================");
  console.log("  BUTELLA — Automated Test Suite");
  console.log("=======================================================\n");

  // 1. Catalog & Data Integrity
  console.log("▶ TEST 1: Catalog & Data Integrity");
  assert(MOCK_PRODUCTS.length >= 6, `Catalog has ${MOCK_PRODUCTS.length} initial products (>= 6)`);
  assert(CATEGORIES.includes("Платья" as any), "Category 'Платья' exists");
  assert(CATEGORIES.includes("Костюмы" as any), "Category 'Костюмы' exists");

  const allValid = MOCK_PRODUCTS.every(
    (p) =>
      p.id &&
      p.title &&
      p.slug &&
      p.basePrice > 0 &&
      p.images.length > 0 &&
      p.variants.length > 0
  );
  assert(allValid, "Every product has ID, Title, Slug, BasePrice > 0, Images, and Variants");

  // 2. Delivery Rates Configuration
  console.log("\n▶ TEST 2: Delivery Rates Calculation");
  assert(getShippingCost("pickup") === 0, "Pickup in Kyzylorda is 0 ₸ (Free)");
  assert(getShippingCost("local") === 1500, "Courier delivery in Kyzylorda is 1 500 ₸");
  assert(getShippingCost("kazakhstan") === 2500, "Kazakhstan postal/CDEK shipping is 2 500 ₸");

  // 3. Checkout Form Zod Validation & Sanitization
  console.log("\n▶ TEST 3: Checkout Form Validation (Zod)");

  // Valid pickup order
  const validPickup = checkoutFormSchema.safeParse({
    customerName: "Айгерим Серикова",
    customerPhone: "+7 (777) 123-45-67",
    deliveryMethod: "pickup",
    items: [
      {
        productId: "prod-1",
        variantId: "var-1-s",
        title: "Шелковое платье",
        size: "S",
        color: "Шампань",
        quantity: 1,
      },
    ],
  });
  assert(validPickup.success, "Valid pickup order successfully passes validation");

  // Invalid: missing address for courier delivery
  const invalidDelivery = checkoutFormSchema.safeParse({
    customerName: "Айгерим",
    customerPhone: "+7 (777) 123-45-67",
    deliveryMethod: "local",
    deliveryAddress: "", // Empty!
    items: [
      {
        productId: "prod-1",
        variantId: "var-1-s",
        title: "Шелковое платье",
        size: "S",
        color: "Шампань",
        quantity: 1,
      },
    ],
  });
  assert(
    !invalidDelivery.success,
    "Courier delivery with missing address is rejected by validator"
  );

  // Invalid: bad phone number
  const invalidPhone = checkoutFormSchema.safeParse({
    customerName: "Айгерим",
    customerPhone: "12345", // Invalid!
    deliveryMethod: "pickup",
    items: [
      {
        productId: "prod-1",
        variantId: "var-1-s",
        title: "Шелковое платье",
        size: "S",
        color: "Шампань",
        quantity: 1,
      },
    ],
  });
  assert(!invalidPhone.success, "Invalid telephone number format is rejected");

  // 4. Owner Authentication Security
  console.log("\n▶ TEST 4: Owner Security & Authentication");
  assert(
    !verifyAdminPassword("wrong-password-123"),
    "Wrong password returns false"
  );
  assert(
    verifyAdminPassword("admin_ddd999"),
    "Configured owner password 'admin_ddd999' returns true"
  );
  const token = getExpectedSessionToken();
  assert(
    typeof token === "string" && token.length > 20,
    `Session token generated securely: ${token.slice(0, 15)}...`
  );

  // 5. Anti-Spam Rate Limiting Engine
  console.log("\n▶ TEST 5: Rate Limiting Engine");
  const testIp = `test_${Date.now()}`;
  const opts = { intervalMs: 5000, maxRequests: 3 };

  assert(checkRateLimit(testIp, opts).isAllowed === true, "Request 1/3 allowed");
  assert(checkRateLimit(testIp, opts).isAllowed === true, "Request 2/3 allowed");
  assert(checkRateLimit(testIp, opts).isAllowed === true, "Request 3/3 allowed");
  assert(
    checkRateLimit(testIp, opts).isAllowed === false,
    "Request 4/3 is BLOCKED by Rate Limiter (HTTP 429)"
  );

  // 6. Kaspi Payment Provider Flow
  console.log("\n▶ TEST 6: Kaspi Payment Provider & Dynamic QR");
  const kaspiInit = await kaspiProvider.initiatePayment({
    orderNumber: "BUT-999001",
    amount: 28500,
    customerPhone: "+7 (777) 123-45-67",
  });
  assert(kaspiInit.status === "PENDING", "Initial Kaspi payment status is PENDING");
  assert(
    kaspiInit.instructions.referenceCode === "BUT-999001",
    "Reference code matches order number"
  );
  assert(
    Boolean(kaspiInit.instructions.payUrl && kaspiInit.instructions.payUrl.includes("BUT-999001")),
    "Kaspi pay URL contains order number"
  );

  // Dynamic QR Code generation test
  const qrPayload = buildKaspiPaymentPayload({
    orderNumber: "BUT-999001",
    amount: 28500,
  });
  assert(
    Boolean(qrPayload.webUrl.includes("pay.kaspi.kz/pay/kob6gsmr")),
    "QR Web URL points to official merchant link pay.kaspi.kz/pay/kob6gsmr"
  );
  assert(
    Boolean(qrPayload.kaspiAppUrl.startsWith("https://pay.kaspi.kz")),
    "Kaspi application URL starts with official https://pay.kaspi.kz"
  );
  assert(
    Boolean(qrPayload.phone === "+7 (705) 392-02-88"),
    "Kaspi recipient phone is explicitly +7 (705) 392-02-88"
  );
  const qrSvg = await generateKaspiQrSvg(qrPayload.qrData);
  assert(
    typeof qrSvg === "string" && qrSvg.includes("<svg") && qrSvg.includes("</svg>"),
    "Dynamic QR code successfully generates valid SVG XML"
  );

  // Webhook verification test: Kaspi Pay format
  const validWebhook = await kaspiProvider.verifyPayment(
    {
      orderNumber: "BUT-999001",
      amount: 28500,
      txn_id: "TXN-TEST-100",
      status: "PAID",
      secret: "admin_ddd999",
    },
    { querySecret: "admin_ddd999" }
  );
  assert(
    validWebhook.isVerified === true && validWebhook.orderNumber === "BUT-999001",
    "Webhook successfully verifies authorized Kaspi Pay callback"
  );

  // Webhook verification test: SMS / Push forwarder parser
  const smsWebhook = await kaspiProvider.verifyPayment(
    {
      text: "Перевод 28 500 ₸ от Даниял с сообщением BUT-999001",
      secret: "admin_ddd999",
    },
    { querySecret: "admin_ddd999" }
  );
  assert(
    smsWebhook.isVerified === true &&
      smsWebhook.orderNumber === "BUT-999001" &&
      smsWebhook.amount === 28500,
    "SMS Gateway parser correctly extracts orderNumber (BUT-999001) and amount (28 500 ₸)"
  );

  // 7. Telegram Bot Keyboard & Control
  console.log("\n▶ TEST 7: Telegram Remote Control Keyboard");
  const newKeyboard = getOrderKeyboard("BUT-1001", "PENDING", "NEW");
  const hasPayBtn = newKeyboard.inline_keyboard.some((row) =>
    row.some((b) => b.callback_data === "pay_BUT-1001")
  );
  const hasCancelBtn = newKeyboard.inline_keyboard.some((row) =>
    row.some((b) => b.callback_data === "cancel_BUT-1001")
  );
  assert(hasPayBtn, "Telegram message provides [Подтвердить оплату] button");
  assert(hasCancelBtn, "Telegram message provides [Отменить заказ] button");

  const paidKeyboard = getOrderKeyboard("BUT-1001", "PAID", "PROCESSING");
  const payBtnRemoved = !paidKeyboard.inline_keyboard.some((row) =>
    row.some((b) => b.callback_data === "pay_BUT-1001")
  );
  assert(paidKeyboard && payBtnRemoved, "Payment button is automatically hidden once order is PAID");

  console.log("\n=======================================================");
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
