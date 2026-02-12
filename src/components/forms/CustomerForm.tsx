"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema, type CustomerFormData } from "@/schemas/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

interface CustomerFormProps {
    initialData?: CustomerFormData & { id: string };
    onSuccess?: (customer?: any) => void;
}

export function CustomerForm({ initialData, onSuccess }: CustomerFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
        defaultValues: initialData || {
            name: "",
            phone: "",
            whatsapp: "",
            email: "",
            document: "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
            notes: "",
        },
    });

    async function onSubmit(data: CustomerFormData) {
        setIsLoading(true);
        try {
            const url = initialData
                ? `/api/customers/${initialData.id}`
                : "/api/customers";

            const method = initialData ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Erro ao salvar cliente");

            const result = await response.json();
            
            toast.success(initialData ? "Cliente atualizado!" : "Cliente criado!");
            onSuccess?.(result.customer);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar cliente.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input id="name" {...form.register("name")} placeholder="Nome completo" />
                    {form.formState.errors.name && (
                        <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" {...form.register("phone")} placeholder="(00) 00000-0000" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input id="whatsapp" {...form.register("whatsapp")} placeholder="(00) 00000-0000" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...form.register("email")} placeholder="email@exemplo.com" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="document">CPF/CNPJ</Label>
                <Input id="document" {...form.register("document")} placeholder="000.000.000-00 ou 00.000.000/0000-00" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" {...form.register("address")} placeholder="Rua, número, bairro" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input id="city" {...form.register("city")} placeholder="Cidade" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input id="state" {...form.register("state")} placeholder="UF" maxLength={2} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input id="zipCode" {...form.register("zipCode")} placeholder="00000-000" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Input id="notes" {...form.register("notes")} placeholder="Informações adicionais" />
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Salvando..." : initialData ? "Atualizar Cliente" : "Criar Cliente"}
                </Button>
            </div>
        </form>
    );
}