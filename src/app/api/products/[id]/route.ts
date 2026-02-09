import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get single product
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Produto não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({ product });
    } catch (error) {
        return NextResponse.json(
            { error: "Erro ao buscar produto" },
            { status: 500 }
        );
    }
}

// PATCH - Update product
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const product = await prisma.product.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                supplierId: body.supplierId || null,
                costPrice: body.costPrice,
                salePrice: body.salePrice,
                profitMargin: body.profitMargin,
                stockQty: body.stockQty,
                minStock: body.minStock,
                active: body.active,
            },
        });

        return NextResponse.json({ product });
    } catch (error) {
        return NextResponse.json(
            { error: "Erro ao atualizar produto" },
            { status: 500 }
        );
    }
}

// DELETE - Delete product
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.product.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Produto excluído com sucesso" });
    } catch (error) {
        return NextResponse.json(
            { error: "Erro ao excluir produto" },
            { status: 500 }
        );
    }
}
