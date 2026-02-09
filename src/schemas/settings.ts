import { z } from "zod";

export const settingsSchema = z.object({
    companyName: z.string().min(1, "Nome da empresa é obrigatório"),
    companyLogo: z.string().url("URL inválida").optional().nullable().or(z.literal("")),
    companyPhone: z.string().optional().nullable(),
    companyEmail: z.string().email("E-mail inválido").optional().nullable().or(z.literal("")),
    companyAddress: z.string().optional().nullable(),
    companyDocument: z.string().optional().nullable(),
    currency: z.string().default("BRL"),
    footerText: z.string().optional().nullable(),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
