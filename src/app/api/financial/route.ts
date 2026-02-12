// Verification: 2026-02-11 18:34:21
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { financialRecordSchema } from "@/schemas/financial";
import { z } from "zod";

export const dynamic = 'force-dynamic';

// GET - List financial records
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category") ?? "";

        const where = category
            ? {
                OR: [
                    { description: { contains: category, mode: "insensitive" as const } },
                ],
            }
            : {};

        const records = await prisma.financialRecord.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                customer: { select: { name: true } },
            }
        });

        return NextResponse.json({ records });
    } catch (error) {
        console.error("Error fetching financial records:", error);
        return NextResponse.json(
            { error: "Erro ao buscar registros financeiros" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = financialRecordSchema.safeParse({
            type: body.type,
            description: body.description,
            category: body.category,
            amount: Number(body.amount),
            paymentMethod: body.paymentMethod,
            paid: !!body.paid,
            paidAt: body.paidAt ?? null,
            dueDate: body.dueDate ?? null,
            customerId: body.customerId ?? null,
            serviceOrderId: body.serviceOrderId ?? null,
        });
        if (!parsed.success) {
            return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
        }
        const data = parsed.data;

        // Create financial record
        console.log("Creating financial record with data:", JSON.stringify(data, null, 2));

        const record = await prisma.financialRecord.create({
            data: {
                type: data.type,
                description: data.description,
                category: data.category || null,
                amount: data.amount,
                paymentMethod: normalizePaymentMethod(data.paymentMethod) || null,
                paid: data.paid,
                paidAt: data.paidAt ? new Date(data.paidAt) : null,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                customerId: data.customerId || null,
                serviceOrderId: data.serviceOrderId || null,
                // userId could be added here if we had the authenticated user in session
            },
        });

        // If linked to a Service Order and paid, we might want to update the OS status or paid flag
        if (data.serviceOrderId && data.paid) {
            await prisma.serviceOrder.update({
                where: { id: data.serviceOrderId },
                data: {
                    paid: true,
                    paidAt: new Date(),
                    paymentMethod: normalizePaymentMethod(data.paymentMethod) || "CASH"
                }
            });
        }

        return NextResponse.json({ record }, { status: 201 });
    } catch (error) {
        console.error("Error creating financial record:", error);
        return NextResponse.json(
            { error: "Erro ao criar registro financeiro" },
            { status: 500 }
        );
    }
}

function normalizePaymentMethod(input?: string | null) {
  if (!input) return null
  const map: Record<string, string> = {
    TRANSFER: "BANK_TRANSFER",
    BANK_TRANSFER: "BANK_TRANSFER",
    CASH: "CASH",
    CREDIT_CARD: "CREDIT_CARD",
    DEBIT_CARD: "DEBIT_CARD",
    PIX: "PIX",
    CHECK: "CHECK",
    OTHER: "OTHER",
  }
  const key = input.toUpperCase()
  return (map[key] as any) ?? null
}

