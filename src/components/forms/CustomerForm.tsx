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
    onSuccess: () => void;
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

            toast.success(initialData ? "Cliente atualizado!" : "Cliente criado!");
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar cliente.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input id="name" {...form.register("name")} placeholder="João Silva" />
                    {form.formState.errors.name && (
                        <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input id="phone" {...form.register("phone")} placeholder="(11) 99999-9999" />
                    {form.formState.errors.phone && (
                        <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp (Opcional)</Label>
                    <Input id="whatsapp" {...form.register("whatsapp")} placeholder="(11) 99999-9999" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" {...form.register("email")} type="email" placeholder="joao@example.com" />
                    {form.formState.errors.email && (
                        <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="document">CPF/CNPJ</Label>
                    <Input id="document" {...form.register("document")} placeholder="000.000.000-00" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input id="zipCode" {...form.register("zipCode")} placeholder="00000-000" />
                </div>
                <div className="col-span-full space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input id="address" {...form.register("address")} placeholder="Rua das Flores, 123" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input id="city" {...form.register("city")} placeholder="São Paulo" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input id="state" {...form.register("state")} placeholder="SP" />
                </div>
                <div className="col-span-full space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Input id="notes" {...form.register("notes")} placeholder="Informações adicionais..." />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Salvando..." : initialData ? "Atualizar Cliente" : "Cadastrar Cliente"}
                </Button>
            </div>
        </form>
    );
}
