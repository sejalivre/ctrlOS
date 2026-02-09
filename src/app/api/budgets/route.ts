import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET - List budgets
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q") ?? "";

        const budgets = await prisma.budget.findMany({
            where: {
                OR: [
                    { customer: { name: { contains: query, mode: "insensitive" } } },
                    { budgetNumber: { contains: query, mode: "insensitive" } },
                ],
            },
            include: {
                customer: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ budgets });
    } catch (error) {
        console.error("Error fetching budgets:", error);
        return NextResponse.json(
            { error: "Erro ao buscar orçamentos" },
            { status: 500 }
        );
    }
}

// POST - Create budget
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Generate simple budget number: BGT-timestamp
        const budgetNumber = `BGT-${Date.now()}`;

        const totalAmount = body.items.reduce((acc: number, item: any) => acc + (item.totalPrice || 0), 0);

        const budget = await prisma.budget.create({
            data: {
                budgetNumber,
                customerId: body.customerId,
                status: body.status || "PENDING",
                validUntil: new Date(body.validUntil),
                notes: body.notes,
                totalAmount,
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
            include: {
                items: true
            }
        });

        return NextResponse.json({ budget }, { status: 201 });
    } catch (error) {
        console.error("Error creating budget:", error);
        return NextResponse.json(
            { error: "Erro ao criar orçamento" },
            { status: 500 }
        );
    }
}
