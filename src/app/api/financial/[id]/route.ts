import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const record = await prisma.financialRecord.update({
            where: { id },
            data: {
                type: body.type,
                category: body.category,
                description: body.description,
                amount: body.amount,
                paymentMethod: body.paymentMethod || null,
                paid: body.paid,
                dueDate: body.dueDate ? new Date(body.dueDate) : null,
                paidAt: body.paidAt ? new Date(body.paidAt) : null,
            },
        });
        return NextResponse.json({ record });
    } catch (error) {
        console.error("Error updating financial record:", error);
        return NextResponse.json(
            { error: "Erro ao atualizar registro" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.financialRecord.delete({ where: { id } });
        return NextResponse.json({ message: "Registro excluído" });
    } catch (error) {
        console.error("Error deleting financial record:", error);
        return NextResponse.json(
            { error: "Erro ao excluir registro" },
            { status: 500 }
        );
    }
}
