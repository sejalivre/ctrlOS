import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ClipboardList, Users, Package, DollarSign, Plus } from "lucide-react";

async function getStats() {
    const [
        customerCount,
        openOrdersCount,
        productCount,
        recentOrders,
    ] = await Promise.all([
        prisma.customer.count(),
        prisma.serviceOrder.count({
            where: { status: { in: ["OPENED", "IN_QUEUE", "IN_PROGRESS", "AWAITING_PARTS"] } },
        }),
        prisma.product.count({ where: { active: true } }),
        prisma.serviceOrder.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { customer: true },
        }),
    ]);

    return { customerCount, openOrdersCount, productCount, recentOrders };
}

export default async function DashboardPage() {
    const { customerCount, openOrdersCount, productCount, recentOrders } = await getStats();

    const stats = [
        {
            title: "Clientes Cadastrados",
            value: customerCount.toString(),
            icon: Users,
            href: "/customers",
            color: "text-blue-500"
        },
        {
            title: "OS Abertas",
            value: openOrdersCount.toString(),
            icon: ClipboardList,
            href: "/os",
            color: "text-orange-500"
        },
        {
            title: "Produtos Ativos",
            value: productCount.toString(),
            icon: Package,
            href: "/products",
            color: "text-green-500"
        },
        {
            title: "Receita do Mês",
            value: "R$ 0,00",
            icon: DollarSign,
            href: "/financial",
            color: "text-emerald-500"
        },
    ];

    const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
        OPENED: { label: "Aberta", variant: "default" },
        IN_QUEUE: { label: "Na Fila", variant: "secondary" },
        IN_PROGRESS: { label: "Em Andamento", variant: "default" },
        AWAITING_PARTS: { label: "Aguardando Peças", variant: "outline" },
        READY: { label: "Pronta", variant: "default" },
        DELIVERED: { label: "Entregue", variant: "secondary" },
        CANCELLED: { label: "Cancelada", variant: "destructive" },
        WARRANTY_RETURN: { label: "Garantia", variant: "outline" },
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Bem-vindo ao seu painel de controle.</p>
                </div>
                <Link href="/os/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova OS
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Link key={stat.title} href={stat.href}>
                        <Card className="transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Recent Orders */}
            <Card>
                <CardHeader>
                    <CardTitle>Ordens de Serviço Recentes</CardTitle>
                    <CardDescription>Últimas OS cadastradas no sistema</CardDescription>
                </CardHeader>
                <CardContent>
                    {recentOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Nenhuma ordem de serviço encontrada.</p>
                            <Link href="/os/new" className="mt-4">
                                <Button variant="outline">Criar Primeira OS</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                                            #{order.orderNumber}
                                        </div>
                                        <div>
                                            <p className="font-medium">{order.customer.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={statusLabels[order.status]?.variant ?? "default"}>
                                        {statusLabels[order.status]?.label ?? order.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
