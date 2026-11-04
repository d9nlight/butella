import { PaymentProvider } from "./types";
import { kaspiProvider } from "./kaspi";

const providers: Record<string, PaymentProvider> = {
  kaspi: kaspiProvider,
};

export function getPaymentProvider(providerId: string = "kaspi"): PaymentProvider {
  const provider = providers[providerId];
  if (!provider) {
    throw new Error(`Неподдерживаемый способ оплаты: ${providerId}`);
  }
  return provider;
}

export function registerPaymentProvider(provider: PaymentProvider) {
  providers[provider.id] = provider;
}
