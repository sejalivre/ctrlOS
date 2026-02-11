// Verification: 2026-02-11 18:34:21
"use client";

import { useState, useEffect, useCallback } from "react";
import { CustomerTable } from "@/components/tables/CustomerTable";
import { CustomerDialog } from "@/components/modals/CustomerDialog";
import { Input } from "@/components/ui/input";
import { Search, Users, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);

    const fetchCustomers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/customers?q=${debouncedSearch}`);
            const data = await response.json();
            setCustomers(data.customers || []);
        } catch (error) {
            console.error("Error loading customers:", error);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
                        <p className="text-sm text-muted-foreground">
                            Cadastre e gerencie as informações dos seus clientes.
                        </p>
                    </div>
                </div>
                <CustomerDialog onRefresh={fetchCustomers} />
            </div>

            <div className="flex items-center gap-2 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome, email ou telefone..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm text-muted-foreground">Carregando clientes...</p>
                </div>
            ) : (
                <CustomerTable customers={customers} onRefresh={fetchCustomers} />
            )}
        </div>
    );
}

