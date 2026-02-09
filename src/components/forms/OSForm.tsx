"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceOrderSchema, type ServiceOrderFormData } from "@/schemas/os";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface OSFormProps {
    onSuccess: () => void;
}

export function OSForm({ onSuccess }: OSFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const form = useForm<ServiceOrderFormData>({
        resolver: zodResolver(serviceOrderSchema),
        defaultValues: {
            customerId: "",
            priority: "NORMAL",
            status: "OPENED",
            equipments: [{
                type: "",
                reportedIssue: "",
                brand: "",
                model: "",
                serialNumber: "",
                accessories: "",
                observations: ""
            }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "equipments",
    });

    // Basic customer fetch (can be improved with search later)
    useEffect(() => {
        async function fetchCustomers() {
            try {
                const response = await fetch("/api/customers?limit=100");
                const data = await response.json();
                setCustomers(data.customers || []);
            } catch (error) {
                console.error("Error loading customers:", error);
            }
        }
        fetchCustomers();
    }, []);

    async function onSubmit(data: ServiceOrderFormData) {
        setIsLoading(true);
        try {
            const response = await fetch("/api/os", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Erro ao abrir OS");

            toast.success("Ordem de Serviço aberta com sucesso!");
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar ordem de serviço.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="customerId">Cliente *</Label>
                    <Select onValueChange={(val) => form.setValue("customerId", val)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                            {customers.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {form.formState.errors.customerId && (
                        <p className="text-sm text-red-500">{form.formState.errors.customerId.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select defaultValue="NORMAL" onValueChange={(val) => form.setValue("priority", val as any)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="LOW">Baixa</SelectItem>
                            <SelectItem value="NORMAL">Normal</SelectItem>
                            <SelectItem value="HIGH">Alta</SelectItem>
                            <SelectItem value="URGENT">Urgente</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Equipamentos</h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ type: "", reportedIssue: "" })}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Outro
                    </Button>
                </div>

                {fields.map((field, index) => (
                    <Card key={field.id}>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-medium text-muted-foreground">Equipamento #{index + 1}</span>
                                {fields.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipo*</Label>
                                    <Input {...form.register(`equipments.${index}.type`)} placeholder="ex: Notebook, PC" />
                                    {form.formState.errors.equipments?.[index]?.type && (
                                        <p className="text-sm text-red-500">{form.formState.errors.equipments[index]?.type?.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Marca</Label>
                                    <Input {...form.register(`equipments.${index}.brand`)} placeholder="ex: Dell, Samsung" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Modelo</Label>
                                    <Input {...form.register(`equipments.${index}.model`)} placeholder="ex: Inspiron 15" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Problema Relatado*</Label>
                                <Input {...form.register(`equipments.${index}.reportedIssue`)} placeholder="O que o cliente disse?" />
                                {form.formState.errors.equipments?.[index]?.reportedIssue && (
                                    <p className="text-sm text-red-500">{form.formState.errors.equipments[index]?.reportedIssue?.message}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Abrindo OS...
                        </>
                    ) : (
                        "Abrir Ordem de Serviço"
                    )}
                </Button>
            </div>
        </form>
    );
}
