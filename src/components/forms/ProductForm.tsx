"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormData } from "@/schemas/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ProductFormProps {
    initialData?: ProductFormData & { id: string };
    onSuccess: () => void;
}

export function ProductForm({ initialData, onSuccess }: ProductFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productSchema as any),
        defaultValues: (initialData as any) || {
            name: "",
            description: "",
            supplierId: "",
            costPrice: 0,
            salePrice: 0,
            profitMargin: 0,
            stockQty: 0,
            minStock: 5,
            active: true,
        },
    });

    async function onSubmit(data: ProductFormData) {
        setIsLoading(true);
        try {
            const url = initialData ? `/api/products/${initialData.id}` : "/api/products";
            const method = initialData ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Erro ao salvar produto");

            toast.success(initialData ? "Produto atualizado!" : "Produto criado!");
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar produto.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-full space-y-2">
                    <Label htmlFor="name">Nome do Produto *</Label>
                    <Input id="name" {...form.register("name")} placeholder="ex: Tela iPhone 13 OLED" />
                    {form.formState.errors.name && (
                        <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                    )}
                </div>

                <div className="col-span-full space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea id="description" {...form.register("description")} placeholder="Detalhes técnicos..." />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="costPrice">Preço de Custo (R$)</Label>
                    <Input id="costPrice" type="number" step="0.01" {...form.register("costPrice", { valueAsNumber: true })} />
                    {form.formState.errors.costPrice && (
                        <p className="text-sm text-red-500">{form.formState.errors.costPrice.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="salePrice">Preço de Venda (R$)</Label>
                    <Input id="salePrice" type="number" step="0.01" {...form.register("salePrice", { valueAsNumber: true })} />
                    {form.formState.errors.salePrice && (
                        <p className="text-sm text-red-500">{form.formState.errors.salePrice.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="stockQty">Estoque Atual</Label>
                    <Input id="stockQty" type="number" {...form.register("stockQty", { valueAsNumber: true })} />
                    {form.formState.errors.stockQty && (
                        <p className="text-sm text-red-500">{form.formState.errors.stockQty.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="minStock">Estoque Mínimo</Label>
                    <Input id="minStock" type="number" {...form.register("minStock", { valueAsNumber: true })} />
                    {form.formState.errors.minStock && (
                        <p className="text-sm text-red-500">{form.formState.errors.minStock.message}</p>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        initialData ? "Atualizar Produto" : "Cadastrar Produto"
                    )}
                </Button>
            </div>
        </form>
    );
}
