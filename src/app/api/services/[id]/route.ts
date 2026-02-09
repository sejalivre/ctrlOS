import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get single service
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const service = await prisma.service.findUnique({
            where: { id },
        });

        if (!service) {
            return NextResponse.json(
                { error: "Serviço não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({ service });
    } catch (error) {
        return NextResponse.json(
            { error: "Erro ao buscar serviço" },
            { status: 500 }
        );
    }
}

// PATCH - Update service
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const service = await prisma.service.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                defaultPrice: body.defaultPrice,
                duration: body.duration || null,
                active: body.active,
            },
        });

        return NextResponse.json({ service });
    } catch (error) {
        return NextResponse.json(
            { error: "Erro ao atualizar serviço" },
            { status: 500 }
        );
    }
}

// DELETE - Delete service
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.service.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Serviço excluído com sucesso" });
    } catch (error) {
        return NextResponse.json(
            { error: "Erro ao excluir serviço" },
            { status: 500 }
        );
    }
}
