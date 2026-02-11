import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET - List items for a service order
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const items = await prisma.serviceOrderItem.findMany({
            where: { serviceOrderId: id },
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
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json({ items });
    } catch (error) {
        console.error("Error fetching OS items:", error);
        return NextResponse.json(
            { error: "Erro ao buscar itens da OS" },
            { status: 500 }
        );
    }
}

// POST - Add item to service order
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { productId, serviceId, description, quantity, unitPrice, discount = 0 } = body;

        // Validate that either productId or serviceId is provided (not both)
        if ((!productId && !serviceId) || (productId && serviceId)) {
            return NextResponse.json(
                { error: "Forneça apenas um produto OU serviço" },
                { status: 400 }
            );
        }

        // Calculate total price
        const totalPrice = (unitPrice * quantity) - discount;

        // Create the item
        const item = await prisma.serviceOrderItem.create({
            data: {
                serviceOrderId: id,
                productId: productId || null,
                serviceId: serviceId || null,
                description,
                quantity,
                unitPrice,
                discount: Number(discount) || 0,
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
        await updateServiceOrderTotal(id);

        return NextResponse.json({ item }, { status: 201 });
    } catch (error) {
        console.error("Error creating OS item:", error);
        return NextResponse.json(
            { error: "Erro ao adicionar item à OS" },
            { status: 500 }
        );
    }
}

// Helper function to update service order total
async function updateServiceOrderTotal(serviceOrderId: string) {
    const items = await prisma.serviceOrderItem.findMany({
        where: { serviceOrderId },
        select: { totalPrice: true },
    });

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    await prisma.serviceOrder.update({
        where: { id: serviceOrderId },
        data: {
            totalAmount
        },
    });
}
