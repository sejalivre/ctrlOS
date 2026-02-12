// Verification: 2026-02-11 18:34:21
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/schemas/product";

export const dynamic = 'force-dynamic';

// GET - List products
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
                    { code: { contains: query, mode: "insensitive" as const } },
                ],
            }
            : {};

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy: { name: "asc" },
                skip: (page - 1) * limit,
                take: limit,
                include: { supplier: { select: { name: true } } },
            }),
            prisma.product.count({ where }),
        ]);

        return NextResponse.json({
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            { error: "Erro ao buscar produtos" },
            { status: 500 }
        );
    }
}

// POST - Create product
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = productSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
        }
        const data = parsed.data;

        const product = await prisma.product.create({
            data: {
                name: data.name,
                description: data.description ?? null,
                supplierId: body.supplierId || null,
                costPrice: data.costPrice,
                salePrice: data.salePrice,
                profitMargin: body.profitMargin ?? null,
                stockQty: data.stockQty,
                minStock: data.minStock,
                active: data.active ?? true,
            },
        });

        return NextResponse.json({ product }, { status: 201 });
    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json(
            { error: "Erro ao criar produto" },
            { status: 500 }
        );
    }
}

