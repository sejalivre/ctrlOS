import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get single customer
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const customer = await prisma.customer.findUnique({
            where: { id: params.id },
        });

        if (!customer) {
            return NextResponse.json(
                { error: "Cliente não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({ customer });
    } catch (error) {
        console.error("Error fetching customer:", error);
        return NextResponse.json(
            { error: "Erro ao buscar cliente" },
            { status: 500 }
        );
    }
}

// PATCH - Update customer
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();

        const customer = await prisma.customer.update({
            where: { id: params.id },
            data: {
                name: body.name,
                phone: body.phone,
                whatsapp: body.whatsapp,
                email: body.email,
                document: body.document,
                address: body.address,
                city: body.city,
                state: body.state,
                zipCode: body.zipCode,
                notes: body.notes,
            },
        });

        return NextResponse.json({ customer });
    } catch (error) {
        console.error("Error updating customer:", error);
        return NextResponse.json(
            { error: "Erro ao atualizar cliente" },
            { status: 500 }
        );
    }
}

// DELETE - Delete customer
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.customer.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: "Cliente excluído com sucesso" });
    } catch (error) {
        console.error("Error deleting customer:", error);
        return NextResponse.json(
            { error: "Erro ao excluir cliente" },
            { status: 500 }
        );
    }
}
