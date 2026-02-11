"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle, Clock, CheckCircle, Ban, TrendingUp, Trophy } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";

interface DashboardData {
    stats: {
        open: number;
        waiting: number;
        finishedMonth: number;
        cancelledMonth: number;
    };
    monthlyRevenue: { name: string; total: number }[];
    technicianRanking: { name: string; total: number }[];
    priorityDistribution: { name: string; value: number }[];
}

const PRIORITY_COLORS: Record<string, string> = {
    LOW: "#22c55e",      // Green
    NORMAL: "#3b82f6",   // Blue
    HIGH: "#f97316",     // Orange
    URGENT: "#ef4444",   // Red
};

const PRIORITY_LABELS: Record<string, string> = {
    LOW: "Baixa",
    NORMAL: "Normal",
    HIGH: "Alta",
    URGENT: "Urgente",
};

export default function OSDashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const res = await fetch("/api/reports/os-dashboard");
                if (res.ok) {
                    setData(await res.json());
                }
            } catch (error) {
                console.error("Error loading dashboard", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchDashboard();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="text-lg font-medium text-slate-600 animate-pulse">Carregando indicadores...</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto">
            <header className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">Indicadores de Performance</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Dashboard de OS</h1>
                <p className="text-slate-500 max-w-2xl">
                    Visão geral da operação técnica, faturamento e produtividade.
                </p>
            </header>

            {/* Cards Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Em Aberto</p>
                                <h3 className="text-3xl font-bold text-slate-900 mt-1">{data.stats.open}</h3>
                                <p className="text-xs text-slate-400 mt-1">OS em andamento ou abertas</p>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Clock className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Aguardando Aprovação</p>
                                <h3 className="text-3xl font-bold text-slate-900 mt-1">{data.stats.waiting}</h3>
                                <p className="text-xs text-slate-400 mt-1">Orçamentos pendentes</p>
                            </div>
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <AlertTriangle className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Finalizadas (Mês)</p>
                                <h3 className="text-3xl font-bold text-slate-900 mt-1">{data.stats.finishedMonth}</h3>
                                <p className="text-xs text-slate-400 mt-1">OS concluídas este mês</p>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Canceladas (Mês)</p>
                                <h3 className="text-3xl font-bold text-slate-900 mt-1">{data.stats.cancelledMonth}</h3>
                                <p className="text-xs text-slate-400 mt-1">OS canceladas este mês</p>
                            </div>
                            <div className="p-2 bg-red-50 rounded-lg">
                                <Ban className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Monthly Revenue Chart */}
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle>Faturamento Mensal (Últimos 6 meses)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.monthlyRevenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `R$ ${value}`}
                                />
                                <RechartsTooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Faturamento']}
                                />
                                <Bar
                                    dataKey="total"
                                    fill="#4f46e5"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Technician Ranking */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            <CardTitle>Ranking de Técnicos (Receita)</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {data.technicianRanking.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">Sem dados de técnicos.</p>
                            ) : (
                                data.technicianRanking.map((tech, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className={`
                                            flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                                            ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                index === 1 ? 'bg-slate-100 text-slate-700' :
                                                    index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white text-slate-500 border'}
                                        `}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900">{tech.name}</p>
                                            <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                                                <div
                                                    className="bg-indigo-600 h-2 rounded-full"
                                                    style={{ width: `${(tech.total / data.technicianRanking[0].total) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <p className="font-bold text-slate-700 text-sm">
                                            R$ {tech.total.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Priority Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>OS Ativas por Prioridade</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.priorityDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.priorityDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name] || "#94a3b8"} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any, name: any) => [value, PRIORITY_LABELS[name] || name]}
                                />
                                <Legend
                                    formatter={(value) => PRIORITY_LABELS[value] || value}
                                    verticalAlign="middle"
                                    align="right"
                                    layout="vertical"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Disclaimer or Additional Info can go here */}
                <div className="flex items-center justify-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-500 text-center">
                        Mais métricas em breve.<br />
                        Para relatórios detalhados, acesse a área de Relatórios.
                    </p>
                </div>
            </div>
        </div>
    );
}
