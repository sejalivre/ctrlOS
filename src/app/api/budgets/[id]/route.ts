import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get single budget
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const budget = await prisma.budget.findUnique({
            where: { id },
            include: {
                customer: true,
                items: {
                    include: {
                        product: true,
                        service: true
                    }
                }
            }
        });

        if (!budget) {
            return NextResponse.json(
                { error: "Orçamento não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({ budget });
    } catch (error) {
        return NextResponse.json(
            { error: "Erro ao buscar orçamento" },
            { status: 500 }
        );
    }
}

// PATCH - Update budget status or details
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Full update supported: status, details, and items (via delete & re-create)

        const updateData: any = {};
        if (body.status) updateData.status = body.status;
        if (body.notes !== undefined) updateData.notes = body.notes;
        if (body.validUntil) updateData.validUntil = new Date(body.validUntil);
        if (body.customerId) updateData.customerId = body.customerId;

        // Start a transaction to update everything
        const budget = await prisma.$transaction(async (tx) => {
            // Update items if provided
            if (body.items) {
                // Delete existing items
                await tx.budgetItem.deleteMany({
                    where: { budgetId: id }
                });

                // Create new items
                await tx.budgetItem.createMany({
                    data: body.items.map((item: any) => ({
                        budgetId: id,
                        productId: item.productId || null,
                        serviceId: item.serviceId || null,
                        description: item.description,
                        quantity: Number(item.quantity),
                        unitPrice: Number(item.unitPrice),
                        discount: Number(item.discount || 0),
                        totalPrice: Number(item.totalPrice),
                    }))
                });

                // Calculate new total
                updateData.totalAmount = body.items.reduce((acc: number, item: any) => acc + (Number(item.totalPrice) || 0), 0);
            }

            // Update budget
            return await tx.budget.update({
                where: { id },
                data: updateData,
                include: { items: true }
            });
        });

        return NextResponse.json({ budget });
    } catch (error: any) {
        console.error("Error updating budget:", error);
        return NextResponse.json(
            { error: "Erro ao atualizar orçamento", details: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Delete budget
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.budget.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Orçamento excluído com sucesso" });
    } catch (error) {
        return NextResponse.json(
            { error: "Erro ao excluir orçamento" },
            { status: 500 }
        );
    }
}
