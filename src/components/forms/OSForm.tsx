"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceOrderSchema, type ServiceOrderFormData } from "@/schemas/os";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Loader2, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { CustomerDialog } from "@/components/modals/CustomerDialog";

interface OSFormProps {
    onSuccess: () => void;
}

export function OSForm({ onSuccess }: OSFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [customers, setCustomers] = useState<{ id: string; name: string; phone?: string; email?: string }[]>([]);
    const [technicians, setTechnicians] = useState<{ id: string; name: string }[]>([]);
    const [warrantyTerms, setWarrantyTerms] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showCustomerDialog, setShowCustomerDialog] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const form = useForm<ServiceOrderFormData>({
        resolver: zodResolver(serviceOrderSchema),
        defaultValues: {
            customerId: "",
            technicianId: "",
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
            warrantyTerms: "",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "equipments",
    });

    // Fetch customers with search functionality
    const fetchCustomers = async (search: string = "") => {
        try {
            const response = await fetch(`/api/customers?q=${search}&limit=20`);
            const data = await response.json();
            return (data.customers || []).map((c: any) => ({
                value: c.id,
                label: c.name,
                subtitle: c.phone || c.email || "",
            }));
        } catch (error) {
            console.error("Error fetching customers:", error);
            return [];
        }
    };

    // Fetch technicians and warranty terms
    useEffect(() => {
        async function fetchData() {
            try {
                const [techRes, warrantyRes] = await Promise.all([
                    fetch("/api/users?role=TECHNICIAN&active=true"),
                    fetch("/api/warranty-terms"),
                ]);

                const techData = await techRes.json();
                const warrantyData = await warrantyRes.json();

                setTechnicians(techData.users || []);
                setWarrantyTerms(warrantyData.terms || []);
            } catch (error) {
                console.error("Error loading data:", error);
            }
        }
        fetchData();
    }, []);

    // Update form when customer is selected
    useEffect(() => {
        if (selectedCustomer) {
            form.setValue("customerId", selectedCustomer.id);
        }
    }, [selectedCustomer, form]);

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

    const handleCustomerSelect = (value: string, option: any) => {
        setSelectedCustomer({ id: value, name: option.label });
        setSearchTerm(option.label);
    };

    const handleCustomerCreated = (customer: any) => {
        if (customer && customer.id && customer.name) {
            setSelectedCustomer({ id: customer.id, name: customer.name });
        }
        setShowCustomerDialog(false);
        toast.success("Cliente cadastrado com sucesso!");
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Search Section */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Cliente *</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowCustomerDialog(true)}
                            >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Novo Cliente
                            </Button>
                        </div>
                        
                        <Combobox
                            placeholder="Digite para buscar cliente..."
                            searchPlaceholder="Buscar cliente por nome..."
                            emptyText="Cliente não encontrado. Clique em 'Novo Cliente' para cadastrar."
                            fetchOptions={fetchCustomers}
                            value={selectedCustomer?.id}
                            valueLabel={selectedCustomer?.name}
                            onValueChange={handleCustomerSelect}
                        />
                        
                        {form.formState.errors.customerId && (
                            <p className="text-sm text-red-500">{form.formState.errors.customerId.message}</p>
                        )}
                        
                        {selectedCustomer && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                                <p className="text-sm text-green-800">
                                    <strong>Cliente selecionado:</strong> {selectedCustomer.name}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Technician and Priority Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="technicianId">Técnico Responsável</Label>
                    <Select onValueChange={(val) => form.setValue("technicianId", val)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um técnico" />
                        </SelectTrigger>
                        <SelectContent>
                            {technicians.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                    {t.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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

            {/* Equipment Section */}
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Acessórios (Carregador, Cabos...)</Label>
                                    <Input {...form.register(`equipments.${index}.accessories`)} placeholder="ex: Carregador, Cabo HDMI" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Condições (Arranhado, Quebrado...)</Label>
                                    <Input {...form.register(`equipments.${index}.observations`)} placeholder="ex: Arranhado na tampa" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Warranty Section */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-lg">Termos de Garantia</h3>
                            <div className="w-64">
                                <Select onValueChange={(val) => {
                                    const term = warrantyTerms.find(t => t.id === val);
                                    if (term) form.setValue("warrantyTerms", term.content);
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Escolher termo pronto..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warrantyTerms.map(t => (
                                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Textarea
                            {...form.register("warrantyTerms")}
                            placeholder="Texto da garantia que aparecerá na OS"
                            className="min-h-[120px]"
                        />
                    </div>
                </CardContent>
            </Card>

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

            {/* Customer Dialog */}
            <CustomerDialog
                isOpen={showCustomerDialog}
                onClose={() => setShowCustomerDialog(false)}
                onSuccess={handleCustomerCreated}
            />
        </form>
    );
}