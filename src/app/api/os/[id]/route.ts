import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serviceOrderSchema, osStatusEnum, priorityEnum } from "@/schemas/os";
import { z } from "zod";

// GET - Get single OS details
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const order = await prisma.serviceOrder.findUnique({
            where: { id },
            include: {
                customer: true,
                equipments: true,
                items: {
                    include: {
                        product: true,
                        service: true,
                    }
                },
                technician: {
                    select: { id: true, name: true, email: true }
                }
            },
        });

        if (!order) {
            return NextResponse.json({ error: "OS não encontrada" }, { status: 404 });
        }

        return NextResponse.json({ order });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar OS" }, { status: 500 });
    }
}

// PATCH - Update OS status or details
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const patchSchema = z.object({
            status: osStatusEnum.optional(),
            priority: priorityEnum.optional(),
            technicianId: z.string().optional(),
            promisedDate: z.string().optional(),
            paymentMethod: z.string().optional(),
            paid: z.boolean().optional(),
            warrantyTerms: z.string().optional(),
            diagnosis: z.string().optional(),
            solution: z.string().optional(),
        });
        const parsed = patchSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
        }
        const { status, priority, technicianId, promisedDate, diagnosis, solution } = parsed.data;
        const paymentMethodInput = parsed.data.paymentMethod;
        const paid = parsed.data.paid;
        const warrantyTerms = parsed.data.warrantyTerms;

        // First update the ServiceOrder itself
        const order = await prisma.serviceOrder.update({
            where: { id },
            data: {
                status: status || undefined,
                priority: priority || undefined,
                technicianId: technicianId || undefined,
                promisedDate: promisedDate ? new Date(promisedDate) : undefined,
                paymentMethod: normalizePaymentMethod(paymentMethodInput) || undefined,
                paid: paid !== undefined ? paid : undefined,
                paidAt: paid ? new Date() : (paid === false ? null : undefined),
                warrantyTerms: warrantyTerms !== undefined ? warrantyTerms : undefined,
            },
        });

        // Handle Financial Record if Paid
        if (paid) {
            const existingRecord = await prisma.financialRecord.findFirst({
                where: { serviceOrderId: id }
            });

            if (existingRecord) {
                await prisma.financialRecord.update({
                    where: { id: existingRecord.id },
                    data: {
                        amount: order.totalAmount,
                        paymentMethod: order.paymentMethod || "CASH",
                        paid: true,
                        paidAt: new Date(),
                    }
                });
            } else {
                await prisma.financialRecord.create({
                    data: {
                        type: "REVENUE",
                        category: "Serviço",
                        description: `OS #${order.orderNumber} - ${order.status}`,
                        amount: order.totalAmount,
                        paymentMethod: order.paymentMethod || "CASH",
                        serviceOrderId: id,
                        customerId: order.customerId,
                        paid: true,
                        paidAt: new Date(),
                    }
                });
            }
        }


        // If diagnosis or solution is provided, update the first equipment (standard for single eq OS)
        if (diagnosis !== undefined || solution !== undefined) {
            const firstEq = await prisma.equipment.findFirst({
                where: { serviceOrderId: id }
            });

            if (firstEq) {
                await prisma.equipment.update({
                    where: { id: firstEq.id },
                    data: {
                        diagnosis: diagnosis || undefined,
                        solution: solution || undefined,
                    }
                });
            }
        }

        return NextResponse.json({ order });
    } catch (error) {
        console.error("Update OS error:", error);
        return NextResponse.json({ error: "Erro ao atualizar OS" }, { status: 500 });
    }
}

// PUT - Update entire OS with items
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const {
            customerId,
            technicianId,
            priority,
            status,
            promisedDate,
            equipments,
            items,
            totalAmount,
            paymentMethod
        } = body;
        const parsed = serviceOrderSchema.safeParse({
            customerId,
            technicianId,
            priority,
            status,
            promisedDate,
            equipments,
            items,
            totalAmount: totalAmount !== undefined ? Number(totalAmount) : undefined,
            paymentMethod,
            warrantyTerms: body.warrantyTerms ?? null,
        });
        if (!parsed.success) {
            return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
        }
        const valid = parsed.data;

        // Start a transaction to update everything
        const result = await prisma.$transaction(async (tx) => {
            // Update ServiceOrder
            const order = await tx.serviceOrder.update({
                where: { id },
                data: {
                    customerId: valid.customerId,
                    technicianId: valid.technicianId || null,
                    priority: valid.priority,
                    status: valid.status,
                    promisedDate: valid.promisedDate ? new Date(valid.promisedDate) : null,
                    totalAmount: valid.totalAmount ? parseFloat(valid.totalAmount.toString()) : 0,
                    paymentMethod: normalizePaymentMethod(valid.paymentMethod) || null,
                    paid: body.paid ?? false,
                    paidAt: body.paid ? new Date() : null,
                    warrantyTerms: valid.warrantyTerms || null,
                },
            });

            // Handle Financial Record for Paid OS
            if (body.paid) {
                const existingRecord = await tx.financialRecord.findFirst({
                    where: { serviceOrderId: id }
                });

                if (existingRecord) {
                    await tx.financialRecord.update({
                        where: { id: existingRecord.id },
                        data: {
                            amount: valid.totalAmount ? parseFloat(valid.totalAmount.toString()) : 0,
                            paymentMethod: normalizePaymentMethod(valid.paymentMethod) || "CASH",
                            paid: true,
                            paidAt: new Date(),
                        }
                    });
                } else {
                    await tx.financialRecord.create({
                        data: {
                            type: "REVENUE",
                            category: "Serviço",
                            description: `OS #${order.orderNumber} - ${valid.status || order.status}`,
                            amount: valid.totalAmount ? parseFloat(valid.totalAmount.toString()) : 0,
                            paymentMethod: normalizePaymentMethod(valid.paymentMethod) || "CASH",
                            serviceOrderId: id,
                            customerId: valid.customerId,
                            paid: true,
                            paidAt: new Date(),
                        }
                    });
                }
            }

            // Delete existing items
            await tx.serviceOrderItem.deleteMany({
                where: { serviceOrderId: id }
            });

            // Create new items if provided
            if (valid.items && valid.items.length > 0) {
                const validItems = valid.items.filter((item: any) => item.description || item.productId || item.serviceId);

                if (validItems.length > 0) {
                    await tx.serviceOrderItem.createMany({
                        data: validItems.map((item: any) => {
                            const q = Number(item.quantity) || 1;
                            const up = Number(item.unitPrice) || 0;
                            const d = Number(item.discount) || 0;
                            const tp = Number(item.totalPrice) || (q * up - d);

                            return {
                                serviceOrderId: id,
                                productId: item.productId || null,
                                serviceId: item.serviceId || null,
                                description: item.description || "Item sem descrição",
                                quantity: q,
                                unitPrice: up,
                                discount: d,
                                totalPrice: tp,
                            };
                        })
                    });
                }
            }

            // Update equipments if provided
            if (valid.equipments && valid.equipments.length > 0) {
                await tx.equipment.deleteMany({
                    where: { serviceOrderId: id }
                });

                await tx.equipment.createMany({
                    data: valid.equipments.map((eq: any) => ({
                        serviceOrderId: id,
                        type: eq.type,
                        brand: eq.brand || null,
                        model: eq.model || null,
                        serialNumber: eq.serialNumber || null,
                        reportedIssue: eq.reportedIssue,
                        diagnosis: eq.diagnosis || null,
                        solution: eq.solution || null,
                        accessories: eq.accessories || null,
                        observations: eq.observations || null,
                    }))
                });
            }

            return order;
        });

        return NextResponse.json({ order: result });
    } catch (error: any) {
        console.error("Update OS error:", error);
        return NextResponse.json({ error: error?.message || "Erro ao atualizar OS" }, { status: 500 });
    }
}

// DELETE - Delete OS
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Note: cascade delete should handle items and equipments
        await prisma.serviceOrder.delete({
            where: { id },
        });

        return NextResponse.json({ message: "OS excluída com sucesso" });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao excluir OS" }, { status: 500 });
    }
}

function normalizePaymentMethod(input?: string | null) {
  if (!input) return null
  const map: Record<string, string> = {
    TRANSFER: "BANK_TRANSFER",
    BANK_TRANSFER: "BANK_TRANSFER",
    CASH: "CASH",
    CREDIT_CARD: "CREDIT_CARD",
    DEBIT_CARD: "DEBIT_CARD",
    PIX: "PIX",
    CHECK: "CHECK",
    OTHER: "OTHER",
  }
  const key = input.toUpperCase()
  return (map[key] as any) ?? null
}
