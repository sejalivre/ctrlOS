// Verification: 2026-02-11 18:34:21
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET - List services
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q") ?? "";

        const where = query
            ? {
                OR: [
                    { name: { contains: query, mode: "insensitive" as const } },
                    { description: { contains: query, mode: "insensitive" as const } },
                ],
            }
            : {};

        const services = await prisma.service.findMany({
            where,
            orderBy: { name: "asc" },
        });

        return NextResponse.json({ services });
    } catch (error) {
        console.error("Error fetching services:", error);
        return NextResponse.json(
            { error: "Erro ao buscar serviços" },
            { status: 500 }
        );
    }
}

// POST - Create service
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const service = await prisma.service.create({
            data: {
                name: body.name,
                description: body.description,
                defaultPrice: body.defaultPrice,
                duration: body.duration || null,
                active: body.active ?? true,
            },
        });

        return NextResponse.json({ service }, { status: 201 });
    } catch (error) {
        console.error("Error creating service:", error);
        return NextResponse.json(
            { error: "Erro ao criar serviço" },
            { status: 500 }
        );
    }
}

