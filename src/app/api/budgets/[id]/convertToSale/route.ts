import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromDatabase } from "@/lib/auth-helpers";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Authenticate user
        const user = await getCurrentUserFromDatabase();
        if (!user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        // 2. Fetch the budget
        const budget = await prisma.budget.findUnique({
            where: { id },
            include: { items: true },
        });

        if (!budget) {
            return NextResponse.json(
                { error: "Orçamento não encontrado" },
                { status: 404 }
            );
        }

        // 3. Process conversion in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const saleNumber = `SALE-${Date.now()}`;

            // Create the Sale
            const sale = await tx.sale.create({
                data: {
                    saleNumber,
                    customerId: budget.customerId,
                    sellerId: user.id,
                    totalAmount: budget.totalAmount,
                    paymentMethod: "CASH", // Default
                    paid: true,
                    items: {
                        create: budget.items.map((item) => ({
                            productId: item.productId,
                            serviceId: item.serviceId,
                            description: item.description,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.totalPrice,
                        })),
                    },
                },
            });

            // Update stock for products
            for (const item of budget.items) {
                if (item.productId) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stockQty: {
                                decrement: item.quantity,
                            },
                        },
                    });
                }
            }

            // Create Financial Record
            await tx.financialRecord.create({
                data: {
                    type: "REVENUE",
                    description: `Venda ${saleNumber} (Origem Orçamento ${budget.budgetNumber})`,
                    amount: budget.totalAmount,
                    paymentMethod: "CASH",
                    saleId: sale.id,
                    paidAt: new Date(),
                },
            });

            // Update Budget status
            await tx.budget.update({
                where: { id },
                data: { status: "CONVERTED" as any },
            });

            return sale;
        });

        return NextResponse.json({
            success: true,
            saleId: result.id,
            saleNumber: result.saleNumber,
        });
    } catch (error: any) {
        console.error("Error converting budget to sale:", error);
        return NextResponse.json(
            { error: error?.message || "Erro ao converter orçamento em venda" },
            { status: 500 }
        );
    }
}
