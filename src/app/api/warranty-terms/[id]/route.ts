import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const term = await prisma.warrantyTerm.update({
            where: { id },
            data: {
                name: body.name,
                content: body.content,
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
