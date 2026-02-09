import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get single budget
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const budget = await prisma.budget.findUnique({
            where: { id },
            include: {
                customer: true,
                items: {
                    include: {
                        product: true,
                        service: true
                    }
                }
            }
        });

        if (!budget) {
            return NextResponse.json(
                { error: "Orçamento não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({ budget });
    } catch (error) {
        return NextResponse.json(
            { error: "Erro ao buscar orçamento" },
            { status: 500 }
        );
    }
}

// PATCH - Update budget status or details
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // If we are updating items, it's more complex. For now, let's support status updates.
        // A full update would require deleting items and re-creating them.

        const updateData: any = {};
        if (body.status) updateData.status = body.status;
        if (body.notes !== undefined) updateData.notes = body.notes;
        if (body.validUntil) updateData.validUntil = new Date(body.validUntil);

        const budget = await prisma.budget.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ budget });
    } catch (error) {
        return NextResponse.json(
            { error: "Erro ao atualizar orçamento" },
            { status: 500 }
        );
    }
}

// DELETE - Delete budget
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.budget.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Orçamento excluído com sucesso" });
    } catch (error) {
        return NextResponse.json(
            { error: "Erro ao excluir orçamento" },
            { status: 500 }
        );
    }
}
