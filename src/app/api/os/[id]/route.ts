import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
        const { status, priority, technicianId, promisedDate, diagnosis, solution } = body;

        // First update the ServiceOrder itself
        const order = await prisma.serviceOrder.update({
            where: { id },
            data: {
                status: status || undefined,
                priority: priority || undefined,
                technicianId: technicianId || undefined,
                promisedDate: promisedDate ? new Date(promisedDate) : undefined,
                paymentMethod: body.paymentMethod || undefined,
            },
        });


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
        console.log("PUT request body:", JSON.stringify(body, null, 2));
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

        // Start a transaction to update everything
        const result = await prisma.$transaction(async (tx) => {
            // Update ServiceOrder
            const order = await tx.serviceOrder.update({
                where: { id },
                data: {
                    customerId,
                    technicianId: technicianId || null,
                    priority,
                    status,
                    promisedDate: promisedDate ? new Date(promisedDate) : null,
                    totalAmount: totalAmount ? parseFloat(totalAmount.toString()) : 0,
                    paymentMethod: paymentMethod || null,
                },
            });

            // Delete existing items
            await tx.serviceOrderItem.deleteMany({
                where: { serviceOrderId: id }
            });

            // Create new items if provided
            if (items && items.length > 0) {
                // Filter out empty items or ensure description exists
                const validItems = items.filter((item: any) => item.description || item.productId || item.serviceId);

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
            if (equipments && equipments.length > 0) {
                // Delete existing equipments
                await tx.equipment.deleteMany({
                    where: { serviceOrderId: id }
                });

                // Create new equipments
                await tx.equipment.createMany({
                    data: equipments.map((eq: any) => ({
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
