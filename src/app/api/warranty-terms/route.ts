// Verification: 2026-02-11 18:34:21
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const terms = await prisma.warrantyTerm.findMany({
            orderBy: { name: "asc" },
        });
        return NextResponse.json({ terms });
    } catch (error) {
        console.error("Error fetching warranty terms:", error);
        return NextResponse.json({ error: "Erro ao buscar termos de garantia" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const term = await prisma.warrantyTerm.create({
            data: {
                name: body.name,
                content: body.content,
            },
        });
        return NextResponse.json({ term }, { status: 201 });
    } catch (error) {
        console.error("Error creating warranty term:", error);
        return NextResponse.json({ error: "Erro ao criar termo de garantia" }, { status: 500 });
    }
}

