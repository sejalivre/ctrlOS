import { z } from "zod";

export const budgetStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED", "CONVERTED"]);

export const budgetItemSchema = z.object({
    productId: z.string().optional().nullable(),
    serviceId: z.string().optional().nullable(),
    description: z.string().min(1, "Descrição é obrigatória"),
    quantity: z.number().int().min(1, "Quantidade deve ser pelo menos 1"),
    unitPrice: z.number().min(0, "Preço unitário deve ser maior ou igual a 0"),
    discount: z.number().min(0, "Desconto deve ser maior ou igual a 0").default(0),
    totalPrice: z.number().min(0, "Preço total deve ser maior ou igual a 0"),
});

export const budgetSchema = z.object({
    customerId: z.string().min(1, "Cliente é obrigatório"),
    status: budgetStatusEnum.default("PENDING"),
    validUntil: z.coerce.date(),
    notes: z.string().optional().nullable(),
    items: z.array(budgetItemSchema).min(1, "O orçamento deve ter pelo menos um item"),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;
export type BudgetItemFormData = z.infer<typeof budgetItemSchema>;
