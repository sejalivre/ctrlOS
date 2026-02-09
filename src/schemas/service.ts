import { z } from "zod";

export const serviceSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    description: z.string().optional().or(z.literal("")),
    defaultPrice: z.number().min(0, "O preço padrão deve ser maior ou igual a 0"),
    duration: z.number().int().optional().nullable(),
    active: z.boolean(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
