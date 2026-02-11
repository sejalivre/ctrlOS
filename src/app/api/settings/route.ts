// Verification: 2026-02-11 18:34:21
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromDatabase } from "@/lib/auth-helpers";

export async function GET() {
    try {
        const user = await getCurrentUserFromDatabase();
        if (!user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const settings = await prisma.systemSettings.findUnique({
            where: { id: "global" }
        });

        if (!settings) {
            // Create default settings if not exists
            const defaultSettings = await prisma.systemSettings.create({
                data: { id: "global" }
            });
            return NextResponse.json({ settings: defaultSettings });
        }

        return NextResponse.json({ settings });
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json({ error: "Erro ao buscar configurações" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUserFromDatabase();
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Apenas administradores podem alterar configurações" }, { status: 403 });
        }

        const body = await request.json();
        const settings = await prisma.systemSettings.upsert({
            where: { id: "global" },
            update: {
                companyName: body.companyName,
                companyLogo: body.companyLogo,
                companyPhone: body.companyPhone,
                companyEmail: body.companyEmail,
                companyAddress: body.companyAddress,
                companyDocument: body.companyDocument,
                currency: body.currency,
                footerText: body.footerText,
            },
            create: {
                id: "global",
                companyName: body.companyName,
                companyLogo: body.companyLogo,
                companyPhone: body.companyPhone,
                companyEmail: body.companyEmail,
                companyAddress: body.companyAddress,
                companyDocument: body.companyDocument,
                currency: body.currency,
                footerText: body.footerText,
            }
        });

        return NextResponse.json({ settings });
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json({ error: "Erro ao atualizar configurações" }, { status: 500 });
    }
}

