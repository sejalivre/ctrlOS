import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Fetch the budget with all its items
        const budget = await prisma.budget.findUnique({
            where: { id },
            include: {
                items: true,
            },
        });

        if (!budget) {
            return NextResponse.json(
                { error: "Orçamento não encontrado" },
                { status: 404 }
            );
        }

        if (budget.status === "APPROVED") {
            // Optional: prevent double conversion? Or just allow it.
        }

        // Start a transaction to create the OS and update the budget status
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get the last order number
            const lastOrder = await tx.serviceOrder.findFirst({
                orderBy: { orderNumber: 'desc' },
                select: { orderNumber: true }
            });

            const orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1000;

            // 2. Separate budget items into products and services totals
            const productsAmount = budget.items
                .filter(item => item.productId)
                .reduce((acc, item) => acc + item.totalPrice, 0);

            const servicesAmount = budget.items
                .filter(item => item.serviceId)
                .reduce((acc, item) => acc + item.totalPrice, 0);

            // 3. Create Service Order
            const os = await tx.serviceOrder.create({
                data: {
                    orderNumber,
                    customerId: budget.customerId,
                    status: "OPENED",
                    priority: "NORMAL",
                    productsAmount,
                    servicesAmount,
                    totalAmount: budget.totalAmount,
                    items: {
                        create: budget.items.map((item) => ({
                            productId: item.productId,
                            serviceId: item.serviceId,
                            description: item.description,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.totalPrice,
                            discount: item.discount || 0,
                        })),
                    },
                },
            });

            // 4. Update Budget status
            await tx.budget.update({
                where: { id },
                data: { status: "APPROVED" },
            });

            return os;
        });

        return NextResponse.json({
            success: true,
            osId: result.id,
            orderNumber: result.orderNumber
        });
    } catch (error: any) {
        console.error("Error converting budget to OS:", error);
        return NextResponse.json(
            { error: error?.message || "Erro ao converter orçamento" },
            { status: 500 }
        );
    }
}
