import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { financialRecordSchema } from "@/schemas/financial";
import { z } from "zod";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const patchSchema = financialRecordSchema.partial();
        const parsed = patchSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
        }
        const data = parsed.data;
        const record = await prisma.financialRecord.update({
            where: { id },
            data: {
                type: data.type || undefined,
                description: data.description || undefined,
                amount: data.amount !== undefined ? Number(data.amount) : undefined,
                paymentMethod: data.paymentMethod || null,
                paid: data.paid !== undefined ? data.paid : undefined,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                paidAt: data.paidAt ? new Date(data.paidAt) : null,
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
