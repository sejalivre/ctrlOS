"use client";

import { useState, useEffect, useCallback } from "react";
import { BudgetTable } from "@/components/tables/BudgetTable";
import { BudgetDialog } from "@/components/modals/BudgetDialog";
import { Input } from "@/components/ui/input";
import { Search, FileText, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export default function BudgetsPage() {
    const [budgets, setBudgets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);

    const fetchBudgets = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/budgets?q=${debouncedSearch}`);
            const data = await response.json();
            setBudgets(data.budgets || []);
        } catch (error) {
            console.error("Error loading budgets:", error);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        fetchBudgets();
    }, [fetchBudgets]);

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <FileText className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Orçamentos</h1>
                        <p className="text-sm text-muted-foreground">
                            Crie e gerencie propostas para seus clientes.
                        </p>
                    </div>
                </div>
                <BudgetDialog onRefresh={fetchBudgets} />
            </div>

            <div className="flex items-center gap-2 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por cliente ou nº..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                    <p className="text-sm text-muted-foreground">Carregando orçamentos...</p>
                </div>
            ) : (
                <BudgetTable budgets={budgets} onRefresh={fetchBudgets} />
            )}
        </div>
    );
}
