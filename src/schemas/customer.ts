import { z } from "zod";

export const customerSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    phone: z.string().min(8, "Telefone inválido"),
    whatsapp: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    document: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    notes: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
