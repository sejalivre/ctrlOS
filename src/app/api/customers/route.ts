// Verification: 2026-02-11 18:34:21
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/schemas/customer";

export const dynamic = 'force-dynamic';

// GET - List customers
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q") ?? "";
        const page = parseInt(searchParams.get("page") ?? "1");
        const limit = parseInt(searchParams.get("limit") ?? "20");

        const where = query
            ? {
                OR: [
                    { name: { contains: query, mode: "insensitive" as const } },
                    { phone: { contains: query } },
                    { email: { contains: query, mode: "insensitive" as const } },
                ],
            }
            : {};

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.customer.count({ where }),
        ]);

        return NextResponse.json({
            customers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching customers:", error);
        return NextResponse.json(
            { error: "Erro ao buscar clientes" },
            { status: 500 }
        );
    }
}

// POST - Create customer
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = customerSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
        }
        const data = parsed.data;

        const customer = await prisma.customer.create({
            data: {
                name: data.name,
                phone: data.phone,
                email: data.email || null,
                document: data.document || null,
                address: data.address || null,
                city: data.city || null,
                state: data.state || null,
                zipCode: data.zipCode || null,
                notes: data.notes || null,
            },
        });

        return NextResponse.json({ customer }, { status: 201 });
    } catch (error) {
        console.error("Error creating customer:", error);
        return NextResponse.json(
            { error: "Erro ao criar cliente" },
            { status: 500 }
        );
    }
}

