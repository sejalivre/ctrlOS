// Verification: 2026-02-11 18:34:21
"use client";

import { useState, useEffect, useCallback } from "react";
import { FinancialTable } from "@/components/tables/FinancialTable";
import { FinancialDialog } from "@/components/modals/FinancialDialog";
import { Input } from "@/components/ui/input";
import { Search, Wallet, Loader2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FinancialPage() {
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);

    const fetchRecords = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/financial?category=${debouncedSearch}`);
            const data = await response.json();
            setRecords(data.records || []);
        } catch (error) {
            console.error("Error loading financial records:", error);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const totalIncome = records
        .filter((r: any) => r.type?.toUpperCase() === "INCOME" || r.type?.toUpperCase() === "REVENUE")
        .reduce((acc, curr: any) => acc + Number(curr.amount), 0);

    const totalExpense = records
        .filter((r: any) => r.type?.toUpperCase() === "EXPENSE")
        .reduce((acc, curr: any) => acc + Number(curr.amount), 0);

    const balance = totalIncome - totalExpense;

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg shadow-inner">
                        <Wallet className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
                        <p className="text-sm text-muted-foreground">
                            Controle de entradas, saídas e fluxo de caixa.
                        </p>
                    </div>
                </div>
                <FinancialDialog onRefresh={fetchRecords} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-green-100 bg-green-50/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Total Receitas</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">
                            R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-red-100 bg-red-50/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-700">Total Despesas</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">
                            R$ {totalExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>
                <Card className={`border-indigo-100 ${balance >= 0 ? "bg-indigo-50/30" : "bg-orange-50/30"}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-700">Saldo Atual</CardTitle>
                        <DollarSign className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${balance >= 0 ? "text-indigo-700" : "text-orange-700"}`}>
                            R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-2 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Filtrar por categoria..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    <p className="text-sm text-muted-foreground font-medium animate-pulse">Sincronizando caixa...</p>
                </div>
            ) : (
                <FinancialTable records={records} onRefresh={fetchRecords} />
            )}
        </div>
    );
}

