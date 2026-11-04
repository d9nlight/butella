import { Order } from "@/types/ecommerce";

export interface PaymentInitiationResult {
  paymentId: string;
  orderNumber: string;
  amount: number;
  status: "PENDING" | "PAID";
  provider: string;
  instructions: {
    recipientName: string;
    recipientPhone: string;
    payUrl?: string;
    qrData?: string;
    referenceCode: string;
    notes: string[];
  };
}

export interface PaymentVerificationResult {
  isVerified: boolean;
  transactionId?: string;
  orderNumber: string;
  amount: number;
  message: string;
}

export interface PaymentProvider {
  readonly id: string;
  readonly name: string;

  initiatePayment(order: {
    orderNumber: string;
    amount: number;
    customerPhone: string;
  }): Promise<PaymentInitiationResult>;

  verifyPayment(payload: any): Promise<PaymentVerificationResult>;
}
