"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceOrderSchema, type ServiceOrderFormData } from "@/schemas/os";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface OSEditFormProps {
    orderId: string;
    initialData?: any;
    onSuccess: () => void;
}

export default function OSEditForm({ orderId, initialData, onSuccess }: OSEditFormProps) {
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<ServiceOrderFormData>({
        resolver: zodResolver(serviceOrderSchema),
        defaultValues: initialData ? {
            customerId: initialData.customerId || "",
            priority: initialData.priority || "NORMAL",
            equipments: initialData.equipments?.length > 0 ? initialData.equipments.map((eq: any) => ({
                type: eq.type || "",
                reportedIssue: eq.reportedIssue || "",
                brand: eq.brand || "",
                model: eq.model || "",
                diagnosis: eq.diagnosis || "",
                solution: eq.solution || "",
            })) : [{
                type: "",
                reportedIssue: "",
                brand: "",
                model: "",
                diagnosis: "",
                solution: "",
            }],
        } : {
            customerId: "",
            priority: "NORMAL",
            equipments: [{
                type: "",
                reportedIssue: "",
                brand: "",
                model: "",
                diagnosis: "",
                solution: "",
            }],
        },
    });

    async function onSubmit(data: ServiceOrderFormData) {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/os/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId: data.customerId,
                    priority: data.priority,
                    equipments: data.equipments,
                }),
            });

            if (!response.ok) {
                throw new Error("Erro ao atualizar OS");
            }

            toast.success("Ordem de Serviço atualizada com sucesso!");
            if (onSuccess) onSuccess();
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
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Cliente *</Label>
                                <Input 
                                    {...form.register("customerId")} 
                                    placeholder="ID do cliente"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Prioridade</Label>
                                <Select 
                                    value={form.watch("priority")} 
                                    onValueChange={(value: "LOW" | "NORMAL" | "HIGH" | "URGENT") => form.setValue("priority", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a prioridade" />
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
                    </div>
                </CardContent>
            </Card>

            {/* Equipamentos */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <h3 className="font-medium">Equipamento</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo *</Label>
                                <Input 
                                    {...form.register("equipments.0.type")} 
                                    placeholder="ex: Notebook, PC"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Marca</Label>
                                <Input 
                                    {...form.register("equipments.0.brand")} 
                                    placeholder="ex: Dell, Samsung"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Modelo</Label>
                                <Input 
                                    {...form.register("equipments.0.model")} 
                                    placeholder="ex: Inspiron 15"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Problema Relatado *</Label>
                            <Textarea 
                                {...form.register("equipments.0.reportedIssue")} 
                                placeholder="Descreva o problema relatado pelo cliente"
                                className="min-h-[80px]"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Diagnóstico</Label>
                                <Textarea 
                                    {...form.register("equipments.0.diagnosis")} 
                                    placeholder="Diagnóstico técnico"
                                    className="min-h-[80px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Solução</Label>
                                <Textarea 
                                    {...form.register("equipments.0.solution")} 
                                    placeholder="Solução aplicada"
                                    className="min-h-[80px]"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

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