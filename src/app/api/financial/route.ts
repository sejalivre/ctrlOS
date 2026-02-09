import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type");
        const category = searchParams.get("category");

        const records = await prisma.financialRecord.findMany({
            where: {
                ...(type && { type: type as any }),
                ...(category && { category: { contains: category, mode: "insensitive" } }),
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ records });
    } catch (error) {
        console.error("Error fetching financial records:", error);
        return NextResponse.json({ error: "Erro ao buscar registros" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const record = await prisma.financialRecord.create({
            data: {
                type: body.type,
                category: body.category,
                description: body.description,
                amount: body.amount,
                paymentMethod: body.paymentMethod || null,
                paid: body.paid ?? false,
                dueDate: body.dueDate ? new Date(body.dueDate) : null,
                paidAt: body.paidAt ? new Date(body.paidAt) : null,
            },
        });
        return NextResponse.json({ record }, { status: 201 });
    } catch (error) {
        console.error("Error creating financial record:", error);
        return NextResponse.json({ error: "Erro ao criar registro" }, { status: 500 });
    }
}
