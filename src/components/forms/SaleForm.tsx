"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saleSchema, type SaleFormData } from "@/schemas/sale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Trash2, Package, Wrench, CreditCard, Banknote, QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface SaleFormProps {
    onSuccess: () => void;
}

const paymentMethods = [
    { value: "CASH", label: "Dinheiro", icon: Banknote },
    { value: "PIX", label: "PIX", icon: QrCode },
    { value: "DEBIT_CARD", label: "Débito", icon: CreditCard },
    { value: "CREDIT_CARD", label: "Crédito", icon: CreditCard },
    { value: "BANK_TRANSFER", label: "Transferência", icon: Banknote },
];

export function SaleForm({ onSuccess }: SaleFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
    const [products, setProducts] = useState<{ id: string; name: string; salePrice: number; stockQty: number }[]>([]);
    const [services, setServices] = useState<{ id: string; name: string; defaultPrice: number }[]>([]);

    const form = useForm<SaleFormData>({
        resolver: zodResolver(saleSchema as any),
        defaultValues: {
            customerId: null,
            paymentMethod: "CASH",
            paid: true,
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

    async function onSubmit(data: SaleFormData) {
        if (fields.length === 0) {
            toast.error("Adicione pelo menos um item à venda.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/sales", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Erro ao realizar venda");

            toast.success("Venda realizada com sucesso!");
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar venda.");
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
            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Cliente (Opcional)</Label>
                        <Select onValueChange={(val) => form.setValue("customerId", val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Balcão / Cliente não identificado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="null">Balcão</SelectItem>
                                {customers.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Forma de Pagamento</Label>
                        <Select onValueChange={(val: any) => form.setValue("paymentMethod", val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o pagamento" />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentMethods.map(pm => (
                                    <SelectItem key={pm.value} value={pm.value}>
                                        <div className="flex items-center">
                                            <pm.icon className="h-4 w-4 mr-2" />
                                            {pm.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-base font-bold">Carrinho de Vendas</Label>
                    <div className="flex gap-2">
                        <Select onValueChange={(val) => addItem('product', val)}>
                            <SelectTrigger className="w-[180px] border-amber-200 bg-amber-50">
                                <Package className="h-4 w-4 mr-2 text-amber-600" />
                                <SelectValue placeholder="Add Produto" />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map(p => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.name} ({p.stockQty} un)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select onValueChange={(val) => addItem('service', val)}>
                            <SelectTrigger className="w-[180px] border-blue-200 bg-blue-50">
                                <Wrench className="h-4 w-4 mr-2 text-blue-600" />
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

                <div className="space-y-2 min-h-[200px] max-h-[400px] overflow-y-auto">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-2 p-3 bg-slate-50 border rounded-lg animate-in fade-in slide-in-from-top-1">
                            <div className="flex-1 space-y-1">
                                <p className="text-xs font-bold text-slate-500 uppercase">Item</p>
                                <p className="text-sm font-medium">{form.watch(`items.${index}.description`)}</p>
                            </div>
                            <div className="w-20 space-y-1">
                                <Label className="text-[10px] uppercase">Qtd</Label>
                                <Input
                                    type="number"
                                    className="h-8"
                                    {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                                    onChange={(e) => {
                                        const qty = Number(e.target.value);
                                        const price = form.getValues(`items.${index}.unitPrice`);
                                        form.setValue(`items.${index}.totalPrice`, qty * price);
                                    }}
                                />
                            </div>
                            <div className="w-28 space-y-1">
                                <Label className="text-[10px] uppercase">Preço Un.</Label>
                                <Label className="block h-8 leading-8 font-bold">
                                    R$ {form.watch(`items.${index}.unitPrice`).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </Label>
                            </div>
                            <div className="w-28 space-y-1">
                                <Label className="text-[10px] uppercase">Subtotal</Label>
                                <Label className="block h-8 leading-8 font-bold text-blue-600">
                                    R$ {(form.watch(`items.${index}.quantity`) * form.watch(`items.${index}.unitPrice`)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </Label>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 text-red-500"
                                onClick={() => remove(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {fields.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground bg-slate-50/50">
                            O carrinho está vazio. Comece adicionando produtos ou serviços.
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-between border-t pt-6">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="paid"
                        checked={form.watch("paid")}
                        onCheckedChange={(val: boolean) => form.setValue("paid", val)}
                    />
                    <Label htmlFor="paid" className="text-sm font-medium cursor-pointer">
                        Venda já paga (Gera entrada no financeiro)
                    </Label>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-baseline gap-2">
                        <span className="text-slate-500 font-medium">TOTAL:</span>
                        <span className="text-4xl font-black text-green-600">
                            R$ {totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading || fields.length === 0}
                        className="w-full md:w-64 h-12 text-lg font-bold shadow-lg"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : "FINALIZAR VENDA"}
                    </Button>
                </div>
            </div>
        </form>
    );
}
