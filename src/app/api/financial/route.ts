// Verification: 2026-02-11 18:34:21
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET - List financial records
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category") ?? "";

        const where = category
            ? {
                OR: [
                    { description: { contains: category, mode: "insensitive" as const } },
                ],
            }
            : {};

        const records = await prisma.financialRecord.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                customer: { select: { name: true } },
            }
        });

        return NextResponse.json({ records });
    } catch (error) {
        console.error("Error fetching financial records:", error);
        return NextResponse.json(
            { error: "Erro ao buscar registros financeiros" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Create financial record
        console.log("Creating financial record with data:", JSON.stringify({
            type: body.type,
            description: body.description,
            category: body.category,
            amount: body.amount,
            paymentMethod: body.paymentMethod,
            paid: body.paid,
            paidAt: body.paidAt,
            customerId: body.customerId,
            serviceOrderId: body.serviceOrderId,
        }, null, 2));

        const record = await prisma.financialRecord.create({
            data: {
                type: body.type, // REVENUE, EXPENSE, etc.
                description: body.description,
                category: body.category || null,
                amount: body.amount,
                paymentMethod: body.paymentMethod,
                paid: body.paid,
                paidAt: body.paidAt ? new Date(body.paidAt) : null,
                dueDate: body.dueDate ? new Date(body.dueDate) : null,
                customerId: body.customerId,
                serviceOrderId: body.serviceOrderId,
                // userId could be added here if we had the authenticated user in session
            },
        });

        // If linked to a Service Order and paid, we might want to update the OS status or paid flag
        if (body.serviceOrderId && body.paid) {
            await prisma.serviceOrder.update({
                where: { id: body.serviceOrderId },
                data: {
                    paid: true,
                    paidAt: new Date(),
                    paymentMethod: body.paymentMethod
                }
            });
        }

        return NextResponse.json({ record }, { status: 201 });
    } catch (error) {
        console.error("Error creating financial record:", error);
        return NextResponse.json(
            { error: "Erro ao criar registro financeiro" },
            { status: 500 }
        );
    }
}

