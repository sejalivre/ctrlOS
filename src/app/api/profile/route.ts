import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromDatabase } from "@/lib/auth-helpers";
import { z } from "zod";

export async function GET() {
  try {
    const user = await getCurrentUserFromDatabase();
    if (!user) {
      // Modo desenvolvimento: retorna usuário mock se DISABLE_AUTH=1
      if (process.env.DISABLE_AUTH === '1') {
        return NextResponse.json({ 
          user: { 
            id: 'dev-user-001',
            name: 'Usuário Desenvolvimento',
            email: 'dev@example.com'
          } 
        });
      }
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao carregar perfil" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const current = await getCurrentUserFromDatabase();
    
    // Modo desenvolvimento: permite edição se DISABLE_AUTH=1
    if (process.env.DISABLE_AUTH === '1') {
      const schema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
      });
      const body = await request.json();
      const parsed = schema.safeParse(body);
      
      if (!parsed.success) {
        return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
      }
      
      // Em dev, apenas retorna os dados atualizados sem salvar no banco
      return NextResponse.json({ 
        user: { 
          id: 'dev-user-001',
          name: parsed.data.name,
          email: parsed.data.email
        } 
      });
    }
    
    // Modo produção: verifica autenticação normal
    if (!current) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
    });
    const body = await request.json();
    const parsed = schema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
    }
    
    const data = parsed.data;

    if (data.email && data.email !== current.email) {
      const emailInUse = await prisma.user.findFirst({
        where: { email: data.email, NOT: { id: current.id } },
      });
      if (emailInUse) {
        return NextResponse.json({ error: "Email já está em uso" }, { status: 409 });
      }
    }

    const user = await prisma.user.update({
      where: { id: current.id },
      data: {
        name: data.name,
        email: data.email,
      },
    });
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 });
  }
}