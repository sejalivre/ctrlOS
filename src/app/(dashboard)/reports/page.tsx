"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart3,
    TrendingUp,
    Package,
    ClipboardList,
    DollarSign,
    Loader2,
    PieChart,
    ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ReportsPage() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchReports() {
            try {
                const response = await fetch("/api/reports");
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error("Error loading reports:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchReports();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="text-lg font-medium text-slate-600 animate-pulse">Gerando inteligência de negócio...</p>
            </div>
        );
    }

    const maxSale = Math.max(...(data?.monthlySales?.map((s: any) => s.total) || [1]));
    const totalRevenue = data?.financialSummary?.find((f: any) => f.type === "INCOME")?._sum?.amount || 0;
    const totalExpense = data?.financialSummary?.find((f: any) => f.type === "EXPENSE")?._sum?.amount || 0;

    return (
        <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
            <header className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">Business Intelligence</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Relatórios & Insights</h1>
                <p className="text-slate-500 max-w-2xl">
                    Acompanhe o desempenho da sua assistência técnica em tempo real com dados agregados de vendas, serviços e financeiro.
                </p>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-md bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                            </div>
                            <Badge variant="outline" className="text-green-600 bg-green-50 border-green-100">+12%</Badge>
                        </div>
                        <p className="text-sm font-medium text-slate-500">Receita Total</p>
                        <h3 className="text-2xl font-black text-slate-900">R$ {Number(totalRevenue).toLocaleString("pt-BR")}</h3>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <ClipboardList className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-slate-500">Serviços Totais</p>
                        <h3 className="text-2xl font-black text-slate-900">
                            {data?.osStatusCounts?.reduce((acc: number, curr: any) => acc + curr._count.id, 0) || 0}
                        </h3>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <Package className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-slate-500">Itens Vendidos</p>
                        <h3 className="text-2xl font-black text-slate-900">
                            {data?.topProducts?.reduce((acc: number, curr: any) => acc + curr._sum.quantity, 0) || 0}
                        </h3>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-indigo-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-white/20 rounded-lg text-white">
                                <DollarSign className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-indigo-100">Saldo Geral</p>
                        <h3 className="text-2xl font-black">R$ {Number(totalRevenue - totalExpense).toLocaleString("pt-BR")}</h3>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart (CSS Based) */}
                <Card className="lg:col-span-2 border-none shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                        <div>
                            <CardTitle className="text-lg font-bold">Evolução de Vendas</CardTitle>
                            <p className="text-xs text-slate-400">Faturamento mensal nos últimos 6 meses</p>
                        </div>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between h-64 px-4 gap-2">
                            {data?.monthlySales?.map((s: any, i: number) => {
                                const height = s.total > 0 ? (s.total / maxSale) * 100 : 5;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer">
                                        <div className="relative w-full flex justify-center items-end">
                                            {/* Tooltip */}
                                            <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10">
                                                R$ {s.total.toLocaleString("pt-BR")}
                                            </div>
                                            <div
                                                className="w-4/5 bg-indigo-500 rounded-t-sm group-hover:bg-indigo-400 transition-all duration-500 ease-out"
                                                style={{ height: `${height}%` }}
                                            />
                                        </div>
                                        <span className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate w-full text-center">
                                            {s.month}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Products List */}
                <Card className="border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Top 5 Produtos</CardTitle>
                        <p className="text-xs text-slate-400">Itens com maior volume de saída</p>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {data?.topProducts?.length === 0 ? (
                            <p className="text-sm text-slate-400 italic py-8 text-center">Inícios as vendas para dados.</p>
                        ) : (
                            data?.topProducts?.map((p: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 group hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">
                                            {i + 1}
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700 truncate max-w-[120px]">{p.description}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-400">{p._sum.quantity} un</span>
                                        <ArrowRight className="h-3 w-3 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* OS Status Pie View (Simulated with Bars) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-none shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-indigo-600" />
                            <CardTitle className="text-lg font-bold">Status de Ordens de Serviço</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data?.osStatusCounts?.map((s: any, i: number) => {
                            const totalOs = data.osStatusCounts.reduce((a: number, c: any) => a + c._count.id, 0);
                            const percent = (s._count.id / totalOs) * 100;
                            return (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                                        <span>{s.status}</span>
                                        <span>{s._count.id} ({percent.toFixed(0)}%)</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-600 rounded-full"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-slate-900 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <DollarSign className="h-32 w-32" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Saúde Financeira</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4 relative z-10">
                        <div>
                            <p className="text-sm text-slate-400 mb-1 font-medium">Lucro Bruto Estimado</p>
                            <h3 className="text-4xl font-black text-emerald-400">
                                R$ {(totalRevenue - totalExpense).toLocaleString("pt-BR")}
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Margem de Contribuição</p>
                                <span className="text-xl font-bold">
                                    {totalRevenue > 0 ? ((totalRevenue - totalExpense) / totalRevenue * 100).toFixed(1) : 0}%
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">ROI Operacional</p>
                                <span className="text-xl font-bold">
                                    {totalExpense > 0 ? ((totalRevenue / totalExpense)).toFixed(2) : 0}x
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
