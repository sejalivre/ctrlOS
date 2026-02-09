import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get single sale
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const sale = await prisma.sale.findUnique({
            where: { id },
            include: {
                customer: true,
                seller: { select: { name: true } },
                items: {
                    include: {
                        product: true,
                        service: true
                    }
                }
            }
        });

        if (!sale) {
            return NextResponse.json(
                { error: "Venda não encontrada" },
                { status: 404 }
            );
        }

        return NextResponse.json({ sale });
    } catch (error) {
        return NextResponse.json(
            { error: "Erro ao buscar venda" },
            { status: 500 }
        );
    }
}

// DELETE - Delete sale (and restore stock!)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.$transaction(async (tx) => {
            const sale = await tx.sale.findUnique({
                where: { id },
                include: { items: true }
            });

            if (!sale) throw new Error("Venda não encontrada");

            // Restore stock
            for (const item of sale.items) {
                if (item.productId) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stockQty: { increment: item.quantity }
                        }
                    });
                }
            }

            // Financial records will be deleted automatically if CASCADE is set, 
            // but let's check schema or delete manually if needed.
            // In schema, FinancialRecord.saleId is optional, so we might need manual cleanup if not cascaded.

            await tx.sale.delete({ where: { id } });
        });

        return NextResponse.json({ message: "Venda cancelada e estoque restaurado" });
    } catch (error) {
        console.error("Error deleting sale:", error);
        return NextResponse.json(
            { error: "Erro ao excluir venda" },
            { status: 500 }
        );
    }
}
