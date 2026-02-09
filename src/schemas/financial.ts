import { z } from "zod";

export const financialTypeEnum = z.enum(["INCOME", "EXPENSE"]);
export const paymentMethodEnum = z.enum(["CASH", "DEBIT_CARD", "CREDIT_CARD", "PIX", "BANK_TRANSFER", "PROMISSORY_NOTE"]);

export const financialRecordSchema = z.object({
    type: financialTypeEnum,
    category: z.string().min(1, "Categoria é obrigatória"),
    description: z.string().min(1, "Descrição é obrigatória"),
    amount: z.number().min(0.01, "Valor deve ser maior que zero"),
    paymentMethod: paymentMethodEnum.optional().nullable(),
    paid: z.boolean().default(false),
    dueDate: z.coerce.date().optional().nullable(),
    paidAt: z.coerce.date().optional().nullable(),
});

export type FinancialRecordFormData = z.infer<typeof financialRecordSchema>;
