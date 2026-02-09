"use client";

import { useState, useEffect, useCallback } from "react";
import { OSTable } from "@/components/tables/OSTable";
import { OSDialog } from "@/components/modals/OSDialog";
import { Input } from "@/components/ui/input";
import {
    Search,
    ClipboardList,
    Loader2,
    Filter,
    Plus
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function OSListPage() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const debouncedSearch = useDebounce(search, 500);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const statusQuery = statusFilter !== "ALL" ? `&status=${statusFilter}` : "";
            const response = await fetch(`/api/os?q=${debouncedSearch}${statusQuery}`);
            const data = await response.json();
            setOrders(data.orders || []);
        } catch (error) {
            console.error("Error loading OS:", error);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, statusFilter]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-900 rounded-lg">
                        <ClipboardList className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Ordens de Serviço</h1>
                        <p className="text-sm text-muted-foreground">
                            Acompanhe e gerencie todos os serviços em andamento.
                        </p>
                    </div>
                </div>
                <OSDialog onRefresh={fetchOrders} />
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="relative flex-1 max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por cliente, modelo ou série..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filtrar por Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos os Status</SelectItem>
                            <SelectItem value="OPENED">Aberta</SelectItem>
                            <SelectItem value="IN_PROGRESS">Em Manutenção</SelectItem>
                            <SelectItem value="READY">Pronta</SelectItem>
                            <SelectItem value="DELIVERED">Entregue</SelectItem>
                            <SelectItem value="CANCELLED">Cancelada</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
                    <p className="text-sm text-muted-foreground">Carregando ordens de serviço...</p>
                </div>
            ) : (
                <OSTable orders={orders} />
            )}
        </div>
    );
}
