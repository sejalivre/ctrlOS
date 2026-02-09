"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { budgetSchema, type BudgetFormData } from "@/schemas/budget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Package, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BudgetFormProps {
    initialData?: any;
    onSuccess: () => void;
}

export function BudgetForm({ initialData, onSuccess }: BudgetFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
    const [products, setProducts] = useState<{ id: string; name: string; salePrice: number }[]>([]);
    const [services, setServices] = useState<{ id: string; name: string; defaultPrice: number }[]>([]);

    const form = useForm<BudgetFormData>({
        resolver: zodResolver(budgetSchema as any),
        defaultValues: (initialData as any) || {
            customerId: "",
            status: "PENDING",
            validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            notes: "",
            items: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const [custRes, prodRes, servRes] = await Promise.all([
                    fetch("/api/customers?limit=100"),
                    fetch("/api/products?limit=100"),
                    fetch("/api/services?limit=100"),
                ]);
                const [custData, prodData, servData] = await Promise.all([
                    custRes.json(),
                    prodRes.json(),
                    servRes.json(),
                ]);
                setCustomers(custData.customers || []);
                setProducts(prodData.products || []);
                setServices(servData.services || []);
            } catch (error) {
                console.error("Error loading form data:", error);
            }
        }
        fetchData();
    }, []);

    const totalAmount = fields.reduce((acc, field, index) => {
        const qty = form.watch(`items.${index}.quantity`) || 0;
        const price = form.watch(`items.${index}.unitPrice`) || 0;
        return acc + (qty * price);
    }, 0);

    async function onSubmit(data: BudgetFormData) {
        setIsLoading(true);
        try {
            const url = initialData ? `/api/budgets/${initialData.id}` : "/api/budgets";
            const method = initialData ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Erro ao salvar orçamento");

            toast.success(initialData ? "Orçamento atualizado!" : "Orçamento criado!");
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar orçamento.");
        } finally {
            setIsLoading(false);
        }
    }

    const addItem = (type: 'product' | 'service', id: string) => {
        if (type === 'product') {
            const item = products.find(p => p.id === id);
            if (item) {
                append({
                    productId: item.id,
                    serviceId: null,
                    description: item.name,
                    quantity: 1,
                    unitPrice: item.salePrice,
                    totalPrice: item.salePrice
                });
            }
        } else {
            const item = services.find(s => s.id === id);
            if (item) {
                append({
                    productId: null,
                    serviceId: item.id,
                    description: item.name,
                    quantity: 1,
                    unitPrice: item.defaultPrice,
                    totalPrice: item.defaultPrice
                });
            }
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Cliente *</Label>
                    <Select
                        defaultValue={form.getValues("customerId")}
                        onValueChange={(val) => form.setValue("customerId", val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                            {customers.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {form.formState.errors.customerId && (
                        <p className="text-sm text-red-500">{form.formState.errors.customerId.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Validade</Label>
                    <Input
                        type="date"
                        {...form.register("validUntil")}
                        defaultValue={form.getValues("validUntil")?.toISOString().split('T')[0]}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-base font-bold">Itens do Orçamento</Label>
                    <div className="flex gap-2">
                        <Select onValueChange={(val) => addItem('product', val)}>
                            <SelectTrigger className="w-[180px]">
                                <Package className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Add Produto" />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select onValueChange={(val) => addItem('service', val)}>
                            <SelectTrigger className="w-[180px]">
                                <Wrench className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Add Serviço" />
                            </SelectTrigger>
                            <SelectContent>
                                {services.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    {fields.map((field, index) => (
                        <Card key={field.id} className="bg-slate-50/50">
                            <CardContent className="p-3">
                                <div className="grid grid-cols-12 gap-2 items-end">
                                    <div className="col-span-6 space-y-1">
                                        <Label className="text-[10px] uppercase">Descrição</Label>
                                        <Input {...form.register(`items.${index}.description`)} />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <Label className="text-[10px] uppercase">Qtd</Label>
                                        <Input
                                            type="number"
                                            {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                                            onChange={(e) => {
                                                const qty = Number(e.target.value);
                                                const price = form.getValues(`items.${index}.unitPrice`);
                                                form.setValue(`items.${index}.totalPrice`, qty * price);
                                            }}
                                        />
                                    </div>
                                    <div className="col-span-3 space-y-1">
                                        <Label className="text-[10px] uppercase">Preço Un.</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                                            onChange={(e) => {
                                                const price = Number(e.target.value);
                                                const qty = form.getValues(`items.${index}.quantity`);
                                                form.setValue(`items.${index}.totalPrice`, qty * price);
                                            }}
                                        />
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {fields.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                            Nenhum item adicionado ao orçamento.
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-start justify-between border-t pt-4">
                <div className="w-full md:max-w-md space-y-2">
                    <Label>Observações</Label>
                    <Textarea {...form.register("notes")} placeholder="Condições de pagamento, prazo de entrega, etc." />
                </div>
                <div className="text-right space-y-2">
                    <p className="text-sm text-muted-foreground">Total do Orçamento</p>
                    <p className="text-3xl font-bold text-green-600">
                        R$ {totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Gerar Orçamento"}
                    </Button>
                </div>
            </div>
        </form>
    );
}
