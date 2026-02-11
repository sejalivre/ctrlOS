import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromDatabase } from "@/lib/auth-helpers";

export const dynamic = 'force-dynamic';

// GET - List sales
export async function GET(request: Request) {
    try {
        const user = await getCurrentUserFromDatabase();
        if (!user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q") ?? "";

        const sales = await prisma.sale.findMany({
            where: {
                OR: [
                    { customer: { name: { contains: query } } },
                    { saleNumber: { contains: query } },
                ],
            },
            include: {
                customer: { select: { name: true } },
                seller: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ sales });
    } catch (error) {
        console.error("Error fetching sales:", error);
        return NextResponse.json(
            { error: "Erro ao buscar vendas" },
            { status: 500 }
        );
    }
}

// POST - Create sale
export async function POST(request: Request) {
    try {
        const user = await getCurrentUserFromDatabase();
        if (!user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const body = await request.json();

        // Generate sale number: SALE-timestamp
        const saleNumber = `SALE-${Date.now()}`;
        const totalAmount = body.items.reduce((acc: number, item: any) => acc + (item.totalPrice || 0), 0);

        // Use transaction to ensure data consistency
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the Sale
            const sale = await tx.sale.create({
                data: {
                    saleNumber,
                    customerId: body.customerId || null,
                    sellerId: user.id, // Usar o ID do usuário do nosso banco
                    totalAmount,
                    paymentMethod: body.paymentMethod || "CASH",
                    paid: body.paid ?? true,
                    items: {
                        create: body.items.map((item: any) => ({
                            productId: item.productId || null,
                            serviceId: item.serviceId || null,
                            description: item.description,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.totalPrice,
                        }))
                    }
                },
                include: { items: true }
            });

            // 2. Update stock for products
            for (const item of body.items) {
                if (item.productId) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stockQty: {
                                decrement: item.quantity
                            }
                        }
                    });
                }
            }

            // 3. Create a financial record (Income)
            if (body.paid) {
                await tx.financialRecord.create({
                    data: {
                        type: "REVENUE",
                        description: `Venda ${saleNumber}`,
                        amount: totalAmount,
                        paymentMethod: body.paymentMethod || "CASH",
                        saleId: sale.id,
                        paidAt: new Date(),
                    }
                });
            }

            return sale;
        });

        return NextResponse.json({ sale: result }, { status: 201 });
    } catch (error) {
        console.error("Error creating sale:", error);
        return NextResponse.json(
            { error: "Erro ao realizar venda" },
            { status: 500 }
        );
    }
}
