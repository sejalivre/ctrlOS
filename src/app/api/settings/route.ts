import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
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
        const session = await getServerSession(authOptions);
        if ((session?.user as any)?.role !== "ADMIN") {
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
