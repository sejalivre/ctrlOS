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
import { Textarea } from "@/components/ui/textarea";

interface OSEditFormProps {
    orderId: string;
    initialData?: any;
    onSuccess: () => void;
}

export function OSEditForm({ orderId, initialData, onSuccess }: OSEditFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);

    const form = useForm<ServiceOrderFormData>({
        // Temporarily disable validation for testing
        // resolver: zodResolver(serviceOrderSchema),
        defaultValues: initialData ? {
            customerId: initialData.customerId || "",
            priority: initialData.priority || "NORMAL",
            status: initialData.status || "OPENED",
            equipments: initialData.equipments?.length > 0 ? initialData.equipments.map((eq: any) => ({
                type: eq.type || "",
                reportedIssue: eq.reportedIssue || "",
                brand: eq.brand || "",
                model: eq.model || "",
                serialNumber: eq.serialNumber || "",
                accessories: eq.accessories || "",
                observations: eq.observations || "",
                diagnosis: eq.diagnosis || "",
                solution: eq.solution || ""
            })) : [{
                type: "",
                reportedIssue: "",
                brand: "",
                model: "",
                serialNumber: "",
                accessories: "",
                observations: "",
                diagnosis: "",
                solution: ""
            }],
        } : {
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
                observations: "",
                diagnosis: "",
                solution: ""
            }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "equipments",
    });

    // Fetch customers
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
        console.log("Form submitted with data:", data);
        setIsSaving(true);
        try {
            // Extract diagnosis and solution from first equipment
            const diagnosis = data.equipments?.[0]?.diagnosis || "";
            const solution = data.equipments?.[0]?.solution || "";
            
            console.log("Sending PATCH request with:", { priority: data.priority, diagnosis, solution });
            
            const response = await fetch(`/api/os/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    priority: data.priority,
                    diagnosis,
                    solution
                }),
            });

            console.log("Response status:", response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Response error:", errorText);
                throw new Error("Erro ao atualizar OS");
            }

            const result = await response.json();
            console.log("Response success:", result);
            
            toast.success("Ordem de Serviço atualizada com sucesso!");
            onSuccess();
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Erro ao salvar ordem de serviço.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="customerId">Cliente *</Label>
                    <Select 
                        value={form.watch("customerId")} 
                        onValueChange={(val) => form.setValue("customerId", val)}
                    >
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
                    <Select 
                        value={form.watch("priority")} 
                        onValueChange={(val) => form.setValue("priority", val as any)}
                    >
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

            {/* Equipamentos */}
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
                                <Textarea 
                                    {...form.register(`equipments.${index}.reportedIssue`)} 
                                    placeholder="Descreva o problema relatado pelo cliente"
                                    className="min-h-[80px]"
                                />
                                {form.formState.errors.equipments?.[index]?.reportedIssue && (
                                    <p className="text-sm text-red-500">{form.formState.errors.equipments[index]?.reportedIssue?.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Diagnóstico</Label>
                                    <Textarea 
                                        {...form.register(`equipments.${index}.diagnosis`)} 
                                        placeholder="Diagnóstico técnico"
                                        className="min-h-[80px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Solução</Label>
                                    <Textarea 
                                        {...form.register(`equipments.${index}.solution`)} 
                                        placeholder="Solução aplicada"
                                        className="min-h-[80px]"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3 pt-4">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => window.history.back()}
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="min-w-[120px]">
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        "Salvar Alterações"
                    )}
                </Button>
            </div>
        </form>
    );
}