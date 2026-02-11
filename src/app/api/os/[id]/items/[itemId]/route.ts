import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// PATCH - Update item (quantity, discount)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string; itemId: string }> }
) {
    try {
        const { itemId } = await params;
        const body = await request.json();
        const { quantity, discount = 0 } = body;

        // Get current item to recalculate total
        const currentItem = await prisma.serviceOrderItem.findUnique({
            where: { id: itemId },
            select: { unitPrice: true, serviceOrderId: true },
        });

        if (!currentItem) {
            return NextResponse.json(
                { error: "Item não encontrado" },
                { status: 404 }
            );
        }

        // Calculate new total price
        const totalPrice = (currentItem.unitPrice * quantity) - discount;

        // Update the item
        const item = await prisma.serviceOrderItem.update({
            where: { id: itemId },
            data: {
                quantity,
                totalPrice,
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        salePrice: true,
                    },
                },
                service: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        defaultPrice: true,
                    },
                },
            },
        });

        // Update service order total amount
        await updateServiceOrderTotal(currentItem.serviceOrderId);

        return NextResponse.json({ item });
    } catch (error) {
        console.error("Error updating OS item:", error);
        return NextResponse.json(
            { error: "Erro ao atualizar item" },
            { status: 500 }
        );
    }
}

// DELETE - Remove item from service order
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; itemId: string }> }
) {
    try {
        const { itemId } = await params;
        // Get item to know which OS to update
        const item = await prisma.serviceOrderItem.findUnique({
            where: { id: itemId },
            select: { serviceOrderId: true },
        });

        if (!item) {
            return NextResponse.json(
                { error: "Item não encontrado" },
                { status: 404 }
            );
        }

        // Delete the item
        await prisma.serviceOrderItem.delete({
            where: { id: itemId },
        });

        // Update service order total amount
        await updateServiceOrderTotal(item.serviceOrderId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting OS item:", error);
        return NextResponse.json(
            { error: "Erro ao remover item" },
            { status: 500 }
        );
    }
}

// Helper function to update service order total
async function updateServiceOrderTotal(serviceOrderId: string) {
    const order = await prisma.serviceOrder.findUnique({
        where: { id: serviceOrderId },
        select: { freightAmount: true, othersAmount: true, discountAmount: true },
    });

    if (!order) return;

    const items = await prisma.serviceOrderItem.findMany({
        where: { serviceOrderId },
        select: { totalPrice: true, productId: true, serviceId: true },
    });

    const productsAmount = items
        .filter((item) => item.productId)
        .reduce((sum, item) => sum + item.totalPrice, 0);

    const servicesAmount = items
        .filter((item) => item.serviceId)
        .reduce((sum, item) => sum + item.totalPrice, 0);

    const totalAmount = (productsAmount + servicesAmount + order.freightAmount + order.othersAmount) - order.discountAmount;

    await prisma.serviceOrder.update({
        where: { id: serviceOrderId },
        data: {
            productsAmount,
            servicesAmount,
            totalAmount
        },
    });
}
