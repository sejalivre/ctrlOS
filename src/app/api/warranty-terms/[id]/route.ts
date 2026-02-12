import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const schema = z.object({
            name: z.string().min(1),
            content: z.string().min(1),
        });
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
        }
        const data = parsed.data;

        const term = await prisma.warrantyTerm.update({
            where: { id },
            data: {
                name: data.name,
                content: data.content,
            },
        });

        return NextResponse.json({ term });
    } catch (error) {
        console.error("Error updating warranty term:", error);
        return NextResponse.json({ error: "Erro ao atualizar termo de garantia" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.warrantyTerm.delete({
            where: { id },
        });
        return NextResponse.json({ message: "Termo excluído com sucesso" });
    } catch (error) {
        console.error("Error deleting warranty term:", error);
        return NextResponse.json({ error: "Erro ao excluir termo de garantia" }, { status: 500 });
    }
}
