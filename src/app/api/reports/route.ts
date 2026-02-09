import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const now = new Date();
        const sixMonthsAgo = subMonths(now, 5);
        const monthStart = startOfMonth(sixMonthsAgo);

        // 1. Sales by Month (Last 6 months)
        const salesByMonth = await prisma.sale.findMany({
            where: {
                createdAt: { gte: monthStart }
            },
            select: {
                totalAmount: true,
                createdAt: true
            }
        });

        const monthlySales = Array.from({ length: 6 }).map((_, i) => {
            const date = subMonths(now, 5 - i);
            const monthLabel = format(date, "MMM/yy");
            const total = salesByMonth
                .filter(s => format(s.createdAt, "MM/yy") === format(date, "MM/yy"))
                .reduce((acc, curr) => acc + Number(curr.totalAmount), 0);

            return { month: monthLabel, total };
        });

        // 2. OS Status Distribution
        const osStatusCounts = await prisma.serviceOrder.groupBy({
            by: ['status'],
            _count: { id: true }
        });

        // 3. Top Products (by quantity sold)
        const topProducts = await prisma.saleItem.groupBy({
            where: { productId: { not: null } },
            by: ['description'],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5
        });

        // 4. Financial Summary (All time)
        const financialSummary = await prisma.financialRecord.groupBy({
            by: ['type'],
            _sum: { amount: true }
        });

        return NextResponse.json({
            monthlySales,
            osStatusCounts,
            topProducts,
            financialSummary
        });
    } catch (error) {
        console.error("Error generating report:", error);
        return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 });
    }
}
