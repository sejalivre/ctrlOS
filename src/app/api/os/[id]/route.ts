import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get single OS details
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const order = await prisma.serviceOrder.findUnique({
            where: { id },
            include: {
                customer: true,
                equipments: true,
                items: {
                    include: {
                        product: true,
                        service: true,
                    }
                },
                technician: {
                    select: { id: true, name: true, email: true }
                }
            },
        });

        if (!order) {
            return NextResponse.json({ error: "OS não encontrada" }, { status: 404 });
        }

        return NextResponse.json({ order });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar OS" }, { status: 500 });
    }
}

// PATCH - Update OS status or details
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, priority, technicianId, promisedDate, diagnosis, solution } = body;

        // First update the ServiceOrder itself
        const order = await prisma.serviceOrder.update({
            where: { id },
            data: {
                status: status || undefined,
                priority: priority || undefined,
                technicianId: technicianId || undefined,
                promisedDate: promisedDate ? new Date(promisedDate) : undefined,
            },
        });

        // If diagnosis or solution is provided, update the first equipment (standard for single eq OS)
        if (diagnosis !== undefined || solution !== undefined) {
            const firstEq = await prisma.equipment.findFirst({
                where: { serviceOrderId: id }
            });

            if (firstEq) {
                await prisma.equipment.update({
                    where: { id: firstEq.id },
                    data: {
                        diagnosis: diagnosis || undefined,
                        solution: solution || undefined,
                    }
                });
            }
        }

        return NextResponse.json({ order });
    } catch (error) {
        console.error("Update OS error:", error);
        return NextResponse.json({ error: "Erro ao atualizar OS" }, { status: 500 });
    }
}

// DELETE - Delete OS
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Note: cascade delete should handle items and equipments
        await prisma.serviceOrder.delete({
            where: { id },
        });

        return NextResponse.json({ message: "OS excluída com sucesso" });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao excluir OS" }, { status: 500 });
    }
}
