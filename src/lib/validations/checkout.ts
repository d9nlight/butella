import { z } from "zod";

export const checkoutItemSchema = z.object({
  productId: z.string().min(1, "ID товара обязателен"),
  variantId: z.string().min(1, "ID размера обязателен"),
  title: z.string().min(1, "Название обязательно"),
  size: z.string().min(1, "Размер обязателен"),
  color: z.string().min(1, "Цвет обязателен"),
  image: z.string().optional(),
  quantity: z.number().int().min(1, "Количество должно быть не менее 1"),
});

export const checkoutFormSchema = z
  .object({
    customerName: z
      .string()
      .trim()
      .min(2, "Введите ваше имя (минимум 2 символа)")
      .max(100, "Имя слишком длинное"),
    customerPhone: z
      .string()
      .trim()
      .refine((val) => {
        const cleaned = val.replace(/\D/g, "");
        return cleaned.length === 11 && (cleaned.startsWith("7") || cleaned.startsWith("8"));
      }, "Введите корректный номер телефона Казахстана: +7 (7XX) XXX-XX-XX"),
    deliveryMethod: z.enum(["pickup", "local", "kazakhstan"], {
      message: "Выберите способ доставки",
    }),
    deliveryAddress: z.string().trim().optional(),
    comment: z.string().trim().max(500, "Комментарий не должен превышать 500 символов").optional(),
    items: z.array(checkoutItemSchema).min(1, "Корзина не должна быть пустой"),
  })
  .refine(
    (data) => {
      if (data.deliveryMethod !== "pickup") {
        return Boolean(data.deliveryAddress && data.deliveryAddress.trim().length >= 5);
      }
      return true;
    },
    {
      message: "Пожалуйста, укажите адрес доставки (город, улица, дом, квартира)",
      path: ["deliveryAddress"],
    }
  );

export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;
