// Verification: 2026-02-11 18:34:21
"use client";

import { useState, useEffect, useCallback } from "react";
import { ServiceTable } from "@/components/tables/ServiceTable";
import { ServiceDialog } from "@/components/modals/ServiceDialog";
import { Input } from "@/components/ui/input";
import { Search, Wrench, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export default function ServicesPage() {
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);

    const fetchServices = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/services?q=${debouncedSearch}`);
            const data = await response.json();
            setServices(data.services || []);
        } catch (error) {
            console.error("Error loading services:", error);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Wrench className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Catálogo de Serviços</h1>
                        <p className="text-sm text-muted-foreground">
                            Defina os serviços prestados e seus preços base.
                        </p>
                    </div>
                </div>
                <ServiceDialog onRefresh={fetchServices} />
            </div>

            <div className="flex items-center gap-2 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar serviço..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm text-muted-foreground">Carregando catálogo...</p>
                </div>
            ) : (
                <ServiceTable services={services} onRefresh={fetchServices} />
            )}
        </div>
    );
}

