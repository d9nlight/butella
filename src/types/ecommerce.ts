export type DeliveryMethod = 'pickup' | 'local' | 'kazakhstan';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

export type OrderStatus = 'NEW' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string; // e.g. "XS", "S", "M", "L", "XL", "Standard"
  color: string; // e.g. "Бежевый", "Черный", "Молочный"
  colorHex?: string; // Optional hex for visual swatches (e.g. #F5F5DC)
  sku?: string;
  stockQuantity: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string; // e.g. "Платья", "Костюмы", "Верхняя одежда", "Блузы"
  basePrice: number; // in KZT
  isActive: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  title: string;
  slug: string;
  price: number;
  size: string;
  color: string;
  image: string;
  quantity: number;
  maxStock: number;
}

export interface DeliveryOption {
  id: DeliveryMethod;
  title: string;
  description: string;
  price: number;
  badge?: string;
}

export interface OrderItem {
  id?: string;
  productId: string;
  variantId: string;
  productName: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  comment?: string;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  items: OrderItem[];
  createdAt: string;
}

export interface CheckoutFormData {
  customerName: string;
  customerPhone: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string;
  comment: string;
}
