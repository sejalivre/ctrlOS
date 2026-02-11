import { z } from "zod";

export const paymentMethodEnum = z.enum(["CASH", "DEBIT_CARD", "CREDIT_CARD", "PIX", "BANK_TRANSFER", "PROMISSORY_NOTE"]);

export const saleItemSchema = z.object({
    productId: z.string().optional().nullable(),
    serviceId: z.string().optional().nullable(),
    description: z.string().min(1, "Descrição é obrigatória"),
    quantity: z.number().int().min(1, "Quantidade deve ser pelo menos 1"),
    unitPrice: z.number().min(0, "Preço unitário deve ser maior ou igual a 0"),
    discount: z.number().min(0, "Desconto deve ser maior ou igual a 0").default(0),
    totalPrice: z.number().min(0, "Preço total deve ser maior ou igual a 0"),
});

export const saleSchema = z.object({
    customerId: z.string().optional().nullable(),
    paymentMethod: paymentMethodEnum.default("CASH"),
    paid: z.boolean().default(true),
    items: z.array(saleItemSchema).min(1, "A venda deve ter pelo menos um item"),
    warrantyTerms: z.string().optional().nullable(),
});

export type SaleFormData = z.infer<typeof saleSchema>;
export type SaleItemFormData = z.infer<typeof saleItemSchema>;
