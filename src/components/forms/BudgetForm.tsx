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
import { Combobox } from "@/components/ui/combobox";
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

    // Reset form when initialData changes
    useEffect(() => {
        if (initialData) {
            form.reset({
                ...initialData,
                validUntil: initialData.validUntil ? new Date(initialData.validUntil) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            });
        }
    }, [initialData, form]);

    const formatDateForInput = (dateValue: any) => {
        if (!dateValue) return "";
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return "";
        return date.toISOString().split('T')[0];
    };

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

    const items = form.watch("items") || [];

    const totalAmount = items.reduce((acc, item) => {
        const qty = item.quantity || 0;
        const price = item.unitPrice || 0;
        const discount = item.discount || 0;
        return acc + (qty * price) - discount;
    }, 0);

    async function onSubmit(data: BudgetFormData) {
        setIsLoading(true);
        try {
            const url = initialData ? `/api/budgets/${initialData.id}` : "/api/budgets";
            const method = initialData ? "PATCH" : "POST";

            const dataWithTotals = {
                ...data,
                items: data.items.map(item => ({
                    ...item,
                    totalPrice: (item.quantity * item.unitPrice) - (item.discount || 0)
                }))
            };

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataWithTotals),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || errorData.error || "Erro ao salvar orçamento");
            }

            toast.success(initialData ? "Orçamento atualizado!" : "Orçamento criado!");
            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Erro ao salvar orçamento.");
        } finally {
            setIsLoading(false);
        }
    }

    const addItem = (type: 'product' | 'service', id: string, itemData?: any) => {
        if (type === 'product') {
            const item = itemData || products.find(p => p.id === id);
            if (item) {
                append({
                    productId: item.id,
                    serviceId: null,
                    description: item.name,
                    quantity: 1,
                    unitPrice: item.salePrice,
                    discount: 0,
                    totalPrice: item.salePrice
                });
            }
        } else {
            const item = itemData || services.find(s => s.id === id);
            if (item) {
                append({
                    productId: null,
                    serviceId: item.id,
                    description: item.name,
                    quantity: 1,
                    unitPrice: item.defaultPrice,
                    discount: 0,
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
                    <Combobox
                        placeholder="Selecione um cliente"
                        searchPlaceholder="Buscar cliente pelo nome..."
                        value={form.watch("customerId")}
                        onValueChange={(val) => form.setValue("customerId", val)}
                        fetchOptions={async (search) => {
                            const res = await fetch(`/api/customers?q=${search}&limit=10`);
                            const data = await res.json();
                            return (data.customers || []).map((c: any) => ({
                                value: c.id,
                                label: c.name,
                                subtitle: c.document || ""
                            }));
                        }}
                    />
                    {form.formState.errors.customerId && (
                        <p className="text-sm text-red-500">{form.formState.errors.customerId.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Validade</Label>
                    <Input
                        type="date"
                        {...form.register("validUntil")}
                        value={formatDateForInput(form.watch("validUntil"))}
                        onChange={(e) => {
                            form.setValue("validUntil", new Date(e.target.value));
                        }}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-base font-bold">Itens do Orçamento</Label>
                    <div className="flex gap-2">
                        <Combobox
                            placeholder="Add Produto..."
                            searchPlaceholder="Buscar produto pelo nome..."
                            className="w-[200px]"
                            fetchOptions={async (search) => {
                                const res = await fetch(`/api/products?q=${search}&limit=10`);
                                const data = await res.json();
                                return (data.products || []).map((p: any) => ({
                                    value: p.id,
                                    label: p.name,
                                    subtitle: `R$ ${p.salePrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} - Estoque: ${p.stockQty}`,
                                    metadata: p
                                }));
                            }}
                            onValueChange={(val, opt) => {
                                if (val && opt) {
                                    addItem('product', val, opt.metadata);
                                }
                            }}
                        />
                        <Combobox
                            placeholder="Add Serviço..."
                            searchPlaceholder="Buscar serviço pelo nome..."
                            className="w-[200px]"
                            fetchOptions={async (search) => {
                                const res = await fetch(`/api/services?q=${search}`);
                                const data = await res.json();
                                return (data.services || []).map((s: any) => ({
                                    value: s.id,
                                    label: s.name,
                                    subtitle: `R$ ${s.defaultPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                                    metadata: s
                                }));
                            }}
                            onValueChange={(val, opt) => {
                                if (val && opt) {
                                    addItem('service', val, opt.metadata);
                                }
                            }}
                        />
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
                                    <div className="col-span-1 space-y-1">
                                        <Label className="text-[10px] uppercase">Qtd</Label>
                                        <Input
                                            type="number"
                                            {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <Label className="text-[10px] uppercase">Preço Un.</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <Label className="text-[10px] uppercase">Desc. (R$)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            {...form.register(`items.${index}.discount`, { valueAsNumber: true })}
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <Label className="text-[10px] uppercase">Total</Label>
                                        <Input
                                            readOnly
                                            disabled
                                            className="bg-slate-100 font-bold"
                                            value={((form.watch(`items.${index}.quantity`) || 0) * (form.watch(`items.${index}.unitPrice`) || 0) - (form.watch(`items.${index}.discount`) || 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
