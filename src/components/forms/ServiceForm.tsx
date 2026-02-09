"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceSchema, type ServiceFormData } from "@/schemas/service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ServiceFormProps {
    initialData?: ServiceFormData & { id: string };
    onSuccess: () => void;
}

export function ServiceForm({ initialData, onSuccess }: ServiceFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ServiceFormData>({
        resolver: zodResolver(serviceSchema),
        defaultValues: (initialData as any) || {
            name: "",
            description: "",
            defaultPrice: 0,
            duration: undefined,
            active: true,
        },
    });

    async function onSubmit(data: ServiceFormData) {
        setIsLoading(true);
        try {
            const url = initialData ? `/api/services/${initialData.id}` : "/api/services";
            const method = initialData ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Erro ao salvar serviço");

            toast.success(initialData ? "Serviço atualizado!" : "Serviço criado!");
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar serviço.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nome do Serviço *</Label>
                    <Input id="name" {...form.register("name")} placeholder="ex: Formatação com Backup" />
                    {form.formState.errors.name && (
                        <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea id="description" {...form.register("description")} placeholder="O que está incluso no serviço?" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="defaultPrice">Preço Padrão (R$)</Label>
                        <Input id="defaultPrice" type="number" step="0.01" {...form.register("defaultPrice", { valueAsNumber: true })} />
                        {form.formState.errors.defaultPrice && (
                            <p className="text-sm text-red-500">{form.formState.errors.defaultPrice.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="duration">Duração (minutos)</Label>
                        <Input id="duration" type="number" {...form.register("duration", { valueAsNumber: true })} placeholder="ex: 60" />
                    </div>
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
                        initialData ? "Atualizar Serviço" : "Cadastrar Serviço"
                    )}
                </Button>
            </div>
        </form>
    );
}
