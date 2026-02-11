// Verification: 2026-02-11 18:34:21
"use client";

import { useState, useEffect, useCallback } from "react";
import { ProductTable } from "@/components/tables/ProductTable";
import { ProductDialog } from "@/components/modals/ProductDialog";
import { Input } from "@/components/ui/input";
import { Search, Package, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/products?q=${debouncedSearch}`);
            const data = await response.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error("Error loading products:", error);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <Package className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Gestão de Produtos</h1>
                        <p className="text-sm text-muted-foreground">
                            Controle seu estoque e preços de venda.
                        </p>
                    </div>
                </div>
                <ProductDialog onRefresh={fetchProducts} />
            </div>

            <div className="flex items-center gap-2 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou código..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                    <p className="text-sm text-muted-foreground">Carregando estoque...</p>
                </div>
            ) : (
                <ProductTable products={products} onRefresh={fetchProducts} />
            )}
        </div>
    );
}

