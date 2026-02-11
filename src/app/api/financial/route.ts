import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Create financial record
        const record = await prisma.financialRecord.create({
            data: {
                type: body.type, // REVENUE, EXPENSE, etc.
                description: body.description,
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
