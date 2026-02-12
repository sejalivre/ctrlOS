import { z } from "zod";

export const financialTypeEnum = z.enum(["REVENUE", "EXPENSE", "INVESTMENT", "LOAN"]);
export const paymentMethodEnum = z.enum(["CASH", "DEBIT_CARD", "CREDIT_CARD", "PIX", "BANK_TRANSFER", "CHECK", "OTHER"]);

export const financialRecordSchema = z.object({
    type: financialTypeEnum,
    category: z.string().optional().nullable(),
    description: z.string().min(1, "Descrição é obrigatória"),
    amount: z.number().min(0.01, "Valor deve ser maior que zero"),
    paymentMethod: paymentMethodEnum.optional().nullable(),
    paid: z.boolean().default(false),
    dueDate: z.coerce.date().optional().nullable(),
    paidAt: z.coerce.date().optional().nullable(),
    customerId: z.string().optional().nullable(),
    serviceOrderId: z.string().optional().nullable(),
});

export type FinancialRecordFormData = z.infer<typeof financialRecordSchema>;
