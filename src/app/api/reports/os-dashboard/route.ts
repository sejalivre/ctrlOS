// Verification: 2026-02-11 18:34:21
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const today = new Date();
        const startOfCurrentMonth = startOfMonth(today);
        const sixMonthsAgo = subMonths(startOfCurrentMonth, 5);

        // 1. Status Counts
        // "Em Aberto" considers active statuses
        const openCount = await prisma.serviceOrder.count({
            where: {
                status: {
                    in: ['OPENED', 'IN_QUEUE', 'IN_PROGRESS', 'AWAITING_PARTS', 'READY']
                }
            }
        });

        // "Aguardando Aprovação" -> Budgets PENDING
        const waitingApprovalCount = await prisma.budget.count({
            where: {
                status: 'PENDING'
            }
        });

        // Finished in the current month (DELIVERED)
        const finishedMonthCount = await prisma.serviceOrder.count({
            where: {
                status: 'DELIVERED',
                updatedAt: {
                    gte: startOfCurrentMonth,
                }
            }
        });

        // Cancelled in the current month
        const cancelledMonthCount = await prisma.serviceOrder.count({
            where: {
                status: 'CANCELLED',
                updatedAt: {
                    gte: startOfCurrentMonth,
                }
            }
        });

        const stats = {
            open: openCount,
            waiting: waitingApprovalCount, // From Budgets
            finishedMonth: finishedMonthCount,
            cancelledMonth: cancelledMonthCount,
        };

        // 2. Monthly Revenue (Last 6 months) -> Based on DELIVERED orders
        const monthlyRevenueRaw = await prisma.serviceOrder.findMany({
            where: {
                status: 'DELIVERED',
                updatedAt: {
                    gte: sixMonthsAgo,
                }
            },
            select: {
                totalAmount: true,
                updatedAt: true,
            }
        });

        const revenueMap = new Map<string, number>();

        for (let i = 5; i >= 0; i--) {
            const date = subMonths(today, i);
            const key = format(date, 'MMM/yyyy', { locale: ptBR });
            revenueMap.set(key, 0);
        }

        monthlyRevenueRaw.forEach(order => {
            const key = format(order.updatedAt, 'MMM/yyyy', { locale: ptBR });
            if (revenueMap.has(key)) {
                revenueMap.set(key, (revenueMap.get(key) || 0) + (order.totalAmount || 0));
            }
        });

        const monthlyRevenue = Array.from(revenueMap.entries()).map(([name, total]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            total
        }));


        // 3. Technician Ranking
        // Fetch DELIVERED orders with technician info
        const techniciansRaw = await prisma.serviceOrder.findMany({
            where: {
                status: 'DELIVERED',
                technicianId: { not: null }
            },
            select: {
                totalAmount: true,
                technician: {
                    select: {
                        name: true
                    }
                }
            }
        });

        const techMap = new Map<string, number>();
        techniciansRaw.forEach(order => {
            if (order.technician?.name) {
                const name = order.technician.name;
                techMap.set(name, (techMap.get(name) || 0) + (order.totalAmount || 0));
            }
        });

        const technicianRanking = Array.from(techMap.entries())
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);


        // 4. Priority Distribution (Active OS)
        const priorityCounts = await prisma.serviceOrder.groupBy({
            by: ['priority'],
            where: {
                status: {
                    in: ['OPENED', 'IN_QUEUE', 'IN_PROGRESS', 'AWAITING_PARTS', 'READY']
                }
            },
            _count: {
                id: true
            }
        });

        const priorityDistribution = priorityCounts.map(item => ({
            name: item.priority,
            value: item._count.id
        }));

        return NextResponse.json({
            stats,
            monthlyRevenue,
            technicianRanking,
            priorityDistribution
        });

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return NextResponse.json(
            { error: "Erro ao carregar dados do dashboard" },
            { status: 500 }
        );
    }
}

