import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET - List Service Orders
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q") ?? "";
        const status = searchParams.get("status") ?? undefined;
        const page = parseInt(searchParams.get("page") ?? "1");
        const limit = parseInt(searchParams.get("limit") ?? "20");

        const where: any = {
            OR: query
                ? [
                    { customer: { name: { contains: query, mode: "insensitive" } } },
                    { equipments: { some: { model: { contains: query, mode: "insensitive" } } } },
                    { equipments: { some: { serialNumber: { contains: query, mode: "insensitive" } } } },
                ]
                : undefined,
            status: status ? (status as any) : undefined,
        };

        const [orders, total] = await Promise.all([
            prisma.serviceOrder.findMany({
                where,
                include: {
                    customer: { select: { name: true, phone: true } },
                    equipments: true,
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.serviceOrder.count({ where }),
        ]);

        return NextResponse.json({
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching OS:", error);
        return NextResponse.json(
            { error: "Erro ao buscar ordens de serviço" },
            { status: 500 }
        );
    }
}

// POST - Create Service Order
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate existence of customer
        const customer = await prisma.customer.findUnique({
            where: { id: body.customerId },
        });

        if (!customer) {
            return NextResponse.json(
                { error: "Cliente não encontrado" },
                { status: 404 }
            );
        }

        // Get the last order number and increment
        const lastOrder = await prisma.serviceOrder.findFirst({
            orderBy: { orderNumber: 'desc' },
            select: { orderNumber: true }
        });
        
        const orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1000;

        const order = await prisma.serviceOrder.create({
            data: {
                orderNumber,
                customerId: body.customerId,
                technicianId: body.technicianId || null,
                status: body.status || "OPENED",
                priority: body.priority || "NORMAL",
                promisedDate: body.promisedDate ? new Date(body.promisedDate) : null,
                equipments: {
                    create: body.equipments.map((eq: any) => ({
                        type: eq.type,
                        brand: eq.brand,
                        model: eq.model,
                        serialNumber: eq.serialNumber,
                        reportedIssue: eq.reportedIssue,
                        accessories: eq.accessories,
                        observations: eq.observations,
                    })),
                },
            },
            include: {
                equipments: true,
            },
        });

        return NextResponse.json({ order }, { status: 201 });
    } catch (error: any) {
        console.error("Error creating OS:", error);
        return NextResponse.json(
            { error: error?.message || "Erro ao criar ordem de serviço" },
            { status: 500 }
        );
    }
}
