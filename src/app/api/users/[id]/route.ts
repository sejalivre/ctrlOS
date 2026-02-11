import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Usuário não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "Erro ao buscar usuário" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Check availability of email if changed
        if (body.email) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    email: body.email,
                    NOT: { id }
                }
            });

            if (existingUser) {
                return NextResponse.json(
                    { error: "Email já está em uso por outro usuário" },
                    { status: 409 }
                );
            }
        }

        const user = await prisma.user.update({
            where: { id },
            data: {
                name: body.name,
                email: body.email,
                role: body.role,
                active: body.active,
            },
        });

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: "Erro ao atualizar usuário" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Soft delete (deactivate)
        const user = await prisma.user.update({
            where: { id },
            data: { active: false },
        });

        return NextResponse.json({ message: "Usuário inativado com sucesso" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "Erro ao inativar usuário" },
            { status: 500 }
        );
    }
}
