import { z } from "zod";

export const productSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    description: z.string().optional().nullable(),
    costPrice: z.number().min(0, "Preço de custo deve ser maior ou igual a 0"),
    salePrice: z.number().min(0, "Preço de venda deve ser maior ou igual a 0"),
    houseSellingPrice: z.number().optional().nullable(),
    stockQty: z.number().min(0).default(0),
    minStock: z.number().min(0).default(5),
    active: z.boolean().default(true),
});

export type ProductFormData = z.infer<typeof productSchema>;
