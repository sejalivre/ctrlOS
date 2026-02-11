import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get("role");
        const activeOnly = searchParams.get("active") === "true";

        const where: any = {};

        if (role) {
            where.role = role;
        }

        if (activeOnly) {
            where.active = true;
        }

        const users = await prisma.user.findMany({
            where,
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                active: true,
                createdAt: true,
            }
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Erro ao buscar usuários" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.name || !body.email || !body.role) {
            return NextResponse.json(
                { error: "Nome, email e cargo são obrigatórios" },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: body.email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Email já cadastrado" },
                { status: 409 }
            );
        }

        // Generate a random authId since we don't have auth system yet
        // In a real app, this would come from the auth provider (e.g. Supabase Auth)
        const authId = crypto.randomUUID();

        const user = await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                role: body.role,
                authId: authId,
                active: true,
            },
        });

        return NextResponse.json({ user }, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Erro ao criar usuário" },
            { status: 500 }
        );
    }
}
