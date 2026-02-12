"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { financialRecordSchema, FinancialRecordFormData } from "@/schemas/financial";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface FinancialFormProps {
    initialData?: any;
    onSuccess: () => void;
}

export function FinancialForm({ initialData, onSuccess }: FinancialFormProps) {
    const form = useForm<FinancialRecordFormData>({
        resolver: zodResolver(financialRecordSchema as any),
        defaultValues: (initialData as any) || {
            type: "EXPENSE",
            category: "",
            description: "",
            amount: 0,
            paid: false,
            paymentMethod: "CASH",
        },
    });

    async function onSubmit(data: FinancialRecordFormData) {
        try {
            const url = initialData ? `/api/financial/${initialData.id}` : "/api/financial";
            const method = initialData ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Erro ao salvar registro");

            toast.success(initialData ? "Registro atualizado!" : "Registro criado!");
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar registro financeiro.");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Tipo de Registro</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="REVENUE">Receita (Entrada)</SelectItem>
                                        <SelectItem value="EXPENSE">Despesa (Saída)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Categoria</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Aluguel, Vendas, Peças" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }: { field: any }) => (
                        <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                                <Input placeholder="Descrição detalhada" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Valor (R$)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        {...field}
                                        onChange={e => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Forma de Pagamento</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="CASH">Dinheiro</SelectItem>
                                        <SelectItem value="PIX">PIX</SelectItem>
                                        <SelectItem value="DEBIT_CARD">Débito</SelectItem>
                                        <SelectItem value="CREDIT_CARD">Crédito</SelectItem>
                                        <SelectItem value="BANK_TRANSFER">Transferência</SelectItem>
                                        <SelectItem value="CHECK">Cheque</SelectItem>
                                        <SelectItem value="OTHER">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border">
                    <FormField
                        control={form.control}
                        name="paid"
                        render={({ field }: { field: any }) => (
                            <FormItem className="flex flex-row items-center justify-between gap-2 space-y-0">
                                <FormLabel className="text-sm font-medium">Pago / Recebido</FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                    ) : (
                        initialData ? "Atualizar Registro" : "Criar Registro"
                    )}
                </Button>
            </form>
        </Form>
    );
}
