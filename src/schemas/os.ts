import { z } from "zod";

export const osStatusEnum = z.enum([
    "OPENED",
    "IN_QUEUE",
    "IN_PROGRESS",
    "AWAITING_PARTS",
    "READY",
    "DELIVERED",
    "CANCELLED",
    "WARRANTY_RETURN",
]);

export const priorityEnum = z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]);

export const equipmentSchema = z.object({
    type: z.string().min(1, "O tipo de equipamento é obrigatório"),
    brand: z.string().optional(),
    model: z.string().optional(),
    serialNumber: z.string().optional(),
    reportedIssue: z.string().min(3, "Descreva o problema relatado"),
    diagnosis: z.string().optional(),
    solution: z.string().optional(),
    accessories: z.string().optional(),
    observations: z.string().optional(),
});

export const serviceOrderItemSchema = z.object({
    productId: z.string().optional(),
    serviceId: z.string().optional(),
    description: z.string().min(1, "Descrição é obrigatória"),
    quantity: z.number().min(1, "Quantidade mínima é 1"),
    unitPrice: z.number().min(0, "Preço unitário não pode ser negativo"),
    totalPrice: z.number().min(0, "Preço total não pode ser negativo"),
});

export const serviceOrderSchema = z.object({
    customerId: z.string().min(1, "Selecione um cliente"),
    technicianId: z.string().optional(),
    priority: priorityEnum,
    status: osStatusEnum,
    promisedDate: z.string().optional(),
    equipments: z.array(equipmentSchema).min(1, "Adicione pelo menos um equipamento"),
    items: z.array(serviceOrderItemSchema).optional(),
    totalAmount: z.number().optional(),
    paymentMethod: z.string().optional(),
});

export type ServiceOrderFormData = z.infer<typeof serviceOrderSchema>;
export type EquipmentFormData = z.infer<typeof equipmentSchema>;
export type ServiceOrderItemFormData = z.infer<typeof serviceOrderItemSchema>;
