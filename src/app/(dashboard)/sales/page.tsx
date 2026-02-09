"use client";

import { useState, useEffect } from "react";
import { SaleTable } from "@/components/tables/SaleTable";
import { SaleDialog } from "@/components/modals/SaleDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ShoppingBag,
    Search,
    Plus,
    TrendingUp,
    Loader2,
    AlertCircle
} from "lucide-react";
import { useDebounce } from "use-debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SalesPage() {
    const [sales, setSales] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 500);

    const fetchSales = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/sales?q=${debouncedSearch}`);
            const data = await response.json();
            setSales(data.sales || []);
        } catch (error) {
            console.error("Error fetching sales:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, [debouncedSearch]);

    return (
        <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <ShoppingBag className="h-5 w-5" />
                        <span className="text-sm font-bold uppercase tracking-widest">Módulo de Vendas</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Vendas & PDV</h1>
                    <p className="text-slate-500">
                        Gerencie vendas diretas, produtos e serviços em uma interface simplificada.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <SaleDialog onRefresh={fetchSales} />
                </div>
            </div>

            {/* Stats Overview (Optional but recommended for rich UI) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-none shadow-md bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-slate-500">Total de Vendas</p>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">{sales.length}</h3>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-slate-500">Faturamento Bruto</p>
                            <span className="text-xs font-bold text-indigo-600">Total</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">
                            R$ {sales.reduce((acc, current: any) => acc + Number(current.totalAmount), 0).toLocaleString('pt-BR')}
                        </h3>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-indigo-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-indigo-100">Ticket Médio</p>
                        </div>
                        <h3 className="text-2xl font-black">
                            R$ {sales.length > 0
                                ? (sales.reduce((acc, current: any) => acc + Number(current.totalAmount), 0) / sales.length).toLocaleString('pt-BR')
                                : '0,00'}
                        </h3>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card className="border-none shadow-lg">
                <CardHeader className="border-b bg-slate-50/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            Histórico de Transações
                        </CardTitle>
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por número da venda ou cliente..."
                                className="pl-10 h-10 border-slate-200 bg-white shadow-sm focus:ring-indigo-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                            <p className="text-slate-500 font-medium">Carregando registros de venda...</p>
                        </div>
                    ) : sales.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 text-center gap-4">
                            <div className="p-4 bg-slate-100 rounded-full">
                                <AlertCircle className="h-10 w-10 text-slate-400" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-slate-900">Nenhuma venda encontrada</h3>
                                <p className="text-slate-500">Realize sua primeira venda no botão "Nova Venda" acima.</p>
                            </div>
                        </div>
                    ) : (
                        <SaleTable sales={sales} onRefresh={fetchSales} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
