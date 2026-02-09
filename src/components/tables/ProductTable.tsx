"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ProductDialog } from "@/components/modals/ProductDialog";
import { Trash2, Package, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Product {
    id: string;
    code: string;
    name: string;
    salePrice: number;
    stockQty: number;
    minStock: number;
    active: boolean;
}

interface ProductTableProps {
    products: Product[];
    onRefresh: () => void;
}

export function ProductTable({ products, onRefresh }: ProductTableProps) {
    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir este produto?")) return;

        try {
            const response = await fetch(`/api/products/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Erro ao excluir produto");

            toast.success("Produto excluído!");
            onRefresh();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao excluir produto.");
        }
    }

    return (
        <div className="rounded-md border bg-white overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Cód.</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Preço Venda</TableHead>
                        <TableHead>Estoque</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                Nenhum produto encontrado.
                            </TableCell>
                        </TableRow>
                    ) : (
                        products.map((product) => {
                            const isLowStock = product.stockQty <= product.minStock;

                            return (
                                <TableRow key={product.id} className="hover:bg-slate-50 transition-colors">
                                    <TableCell className="text-xs font-mono text-muted-foreground">
                                        {product.code.split('-')[0]}
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>
                                        R$ {Number(product.salePrice).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className={isLowStock ? "text-red-500 font-bold" : ""}>
                                                {product.stockQty} unid.
                                            </span>
                                            {isLowStock && (
                                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={product.active ? "secondary" : "outline"}>
                                            {product.active ? "Ativo" : "Inativo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <ProductDialog
                                                initialData={product}
                                                onRefresh={onRefresh}
                                            />
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(product.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
