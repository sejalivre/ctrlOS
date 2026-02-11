"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceOrderSchema, type ServiceOrderFormData } from "@/schemas/os";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Loader2, Package, Wrench, DollarSign, Calculator } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface OSEditFormProps {
    orderId: string;
    initialData?: any;
    onSuccess: () => void;
}

interface Product {
    id: string;
    name: string;
    salePrice: number;
    stockQty: number;
}

interface Service {
    id: string;
    name: string;
    defaultPrice: number;
}

export function OSEditForm({ orderId, initialData, onSuccess }: OSEditFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const [selectedServices, setSelectedServices] = useState<any[]>([]);
    const [subtotal, setSubtotal] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [total, setTotal] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<string>("");

    const form = useForm<ServiceOrderFormData>({
        resolver: zodResolver(serviceOrderSchema),
        defaultValues: initialData || {
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

    // Fetch customers, products, and services
    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch customers
                const customersResponse = await fetch("/api/customers?limit=100");
                const customersData = await customersResponse.json();
                setCustomers(customersData.customers || []);

                // Fetch products
                const productsResponse = await fetch("/api/products?active=true");
                const productsData = await productsResponse.json();
                setProducts(productsData.products || []);

                // Fetch services
                const servicesResponse = await fetch("/api/services?active=true");
                const servicesData = await servicesResponse.json();
                setServices(servicesData.services || []);

                // If initialData exists, load existing items
                if (initialData?.items) {
                    const productItems = initialData.items.filter((item: any) => item.productId);
                    const serviceItems = initialData.items.filter((item: any) => item.serviceId);
                    
                    setSelectedProducts(productItems.map((item: any) => ({
                        id: item.id,
                        productId: item.productId,
                        name: item.product?.name || item.description,
                        quantity: item.quantity,
                        unitPrice: parseFloat(item.unitPrice.toString()),
                        totalPrice: parseFloat(item.totalPrice.toString())
                    })));

                    setSelectedServices(serviceItems.map((item: any) => ({
                        id: item.id,
                        serviceId: item.serviceId,
                        name: item.service?.name || item.description,
                        quantity: item.quantity,
                        unitPrice: parseFloat(item.unitPrice.toString()),
                        totalPrice: parseFloat(item.totalPrice.toString())
                    })));
                }

                // Load payment method if exists
                if (initialData?.paymentMethod) {
                    setPaymentMethod(initialData.paymentMethod);
                }
            } catch (error) {
                console.error("Error loading data:", error);
            }
        }
        fetchData();
    }, [initialData]);

    // Calculate totals when products or services change
    useEffect(() => {
        const productsTotal = selectedProducts.reduce((sum, item) => sum + item.totalPrice, 0);
        const servicesTotal = selectedServices.reduce((sum, item) => sum + item.totalPrice, 0);
        const newSubtotal = productsTotal + servicesTotal;
        const newTotal = newSubtotal - discount;
        
        setSubtotal(newSubtotal);
        setTotal(newTotal);
    }, [selectedProducts, selectedServices, discount]);

    const handleAddProduct = () => {
        if (products.length === 0) return;
        
        const defaultProduct = products[0];
        setSelectedProducts([...selectedProducts, {
            id: `temp-${Date.now()}`,
            productId: defaultProduct.id,
            name: defaultProduct.name,
            quantity: 1,
            unitPrice: parseFloat(defaultProduct.salePrice.toString()),
            totalPrice: parseFloat(defaultProduct.salePrice.toString())
        }]);
    };

    const handleAddService = () => {
        if (services.length === 0) return;
        
        const defaultService = services[0];
        setSelectedServices([...selectedServices, {
            id: `temp-${Date.now()}`,
            serviceId: defaultService.id,
            name: defaultService.name,
            quantity: 1,
            unitPrice: parseFloat(defaultService.defaultPrice.toString()),
            totalPrice: parseFloat(defaultService.defaultPrice.toString())
        }]);
    };

    const handleProductChange = (index: number, field: string, value: any) => {
        const updatedProducts = [...selectedProducts];
        
        if (field === 'productId') {
            const product = products.find(p => p.id === value);
            if (product) {
                updatedProducts[index] = {
                    ...updatedProducts[index],
                    productId: value,
                    name: product.name,
                    unitPrice: parseFloat(product.salePrice.toString()),
                    totalPrice: parseFloat(product.salePrice.toString()) * updatedProducts[index].quantity
                };
            }
        } else if (field === 'quantity') {
            const qty = parseInt(value) || 1;
            updatedProducts[index] = {
                ...updatedProducts[index],
                quantity: qty,
                totalPrice: updatedProducts[index].unitPrice * qty
            };
        } else if (field === 'unitPrice') {
            const price = parseFloat(value) || 0;
            updatedProducts[index] = {
                ...updatedProducts[index],
                unitPrice: price,
                totalPrice: price * updatedProducts[index].quantity
            };
        }
        
        setSelectedProducts(updatedProducts);
    };

    const handleServiceChange = (index: number, field: string, value: any) => {
        const updatedServices = [...selectedServices];
        
        if (field === 'serviceId') {
            const service = services.find(s => s.id === value);
            if (service) {
                updatedServices[index] = {
                    ...updatedServices[index],
                    serviceId: value,
                    name: service.name,
                    unitPrice: parseFloat(service.defaultPrice.toString()),
                    totalPrice: parseFloat(service.defaultPrice.toString()) * updatedServices[index].quantity
                };
            }
        } else if (field === 'quantity') {
            const qty = parseInt(value) || 1;
            updatedServices[index] = {
                ...updatedServices[index],
                quantity: qty,
                totalPrice: updatedServices[index].unitPrice * qty
            };
        } else if (field === 'unitPrice') {
            const price = parseFloat(value) || 0;
            updatedServices[index] = {
                ...updatedServices[index],
                unitPrice: price,
                totalPrice: price * updatedServices[index].quantity
            };
        }
        
        setSelectedServices(updatedServices);
    };

    const handleRemoveProduct = (index: number) => {
        setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
    };

    const handleRemoveService = (index: number) => {
        setSelectedServices(selectedServices.filter((_, i) => i !== index));
    };

    async function onSubmit(data: ServiceOrderFormData) {
        setIsSaving(true);
        try {
            // Prepare items data
            const items = [
                ...selectedProducts.map(item => ({
                    productId: item.productId,
                    description: item.name,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice
                })),
                ...selectedServices.map(item => ({
                    serviceId: item.serviceId,
                    description: item.name,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice
                }))
            ];

            const requestData = {
                ...data,
                items,
                totalAmount: total,
                paymentMethod: paymentMethod || null
            };

            const response = await fetch(`/api/os/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) throw new Error("Erro ao atualizar OS");

            toast.success("Ordem de Serviço atualizada com sucesso!");
            onSuccess();
        } catch (error) {
            console.error(error);
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

            {/* Produtos */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Produtos
                    </h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddProduct}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Produto
                    </Button>
                </div>

                {selectedProducts.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-8 text-center text-muted-foreground">
                            <Package className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            <p>Nenhum produto adicionado</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {selectedProducts.map((product, index) => (
                            <Card key={product.id}>
                                <CardContent className="pt-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-sm font-medium">Produto #{index + 1}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500"
                                            onClick={() => handleRemoveProduct(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <Label>Produto</Label>
                                            <Select 
                                                value={product.productId} 
                                                onValueChange={(val) => handleProductChange(index, 'productId', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {products.map((p) => (
                                                        <SelectItem key={p.id} value={p.id}>
                                                            {p.name} - R$ {parseFloat(p.salePrice.toString()).toFixed(2)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Quantidade</Label>
                                            <Input 
                                                type="number" 
                                                min="1"
                                                value={product.quantity}
                                                onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Preço Unitário (R$)</Label>
                                            <Input 
                                                type="number" 
                                                step="0.01"
                                                min="0"
                                                value={product.unitPrice}
                                                onChange={(e) => handleProductChange(index, 'unitPrice', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Total (R$)</Label>
                                            <Input 
                                                type="number" 
                                                value={product.totalPrice.toFixed(2)}
                                                readOnly
                                                className="bg-gray-50"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Serviços */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        Serviços
                    </h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddService}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Serviço
                    </Button>
                </div>

                {selectedServices.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-8 text-center text-muted-foreground">
                            <Wrench className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            <p>Nenhum serviço adicionado</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {selectedServices.map((service, index) => (
                            <Card key={service.id}>
                                <CardContent className="pt-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-sm font-medium">Serviço #{index + 1}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500"
                                            onClick={() => handleRemoveService(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <Label>Serviço</Label>
                                            <Select 
                                                value={service.serviceId} 
                                                onValueChange={(val) => handleServiceChange(index, 'serviceId', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {services.map((s) => (
                                                        <SelectItem key={s.id} value={s.id}>
                                                            {s.name} - R$ {parseFloat(s.defaultPrice.toString()).toFixed(2)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Quantidade</Label>
                                            <Input 
                                                type="number" 
                                                min="1"
                                                value={service.quantity}
                                                onChange={(e) => handleServiceChange(index, 'quantity', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Preço Unitário (R$)</Label>
                                            <Input 
                                                type="number" 
                                                step="0.01"
                                                min="0"
                                                value={service.unitPrice}
                                                onChange={(e) => handleServiceChange(index, 'unitPrice', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Total (R$)</Label>
                                            <Input 
                                                type="number" 
                                                value={service.totalPrice.toFixed(2)}
                                                readOnly
                                                className="bg-gray-50"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Resumo Financeiro */}
            <Card>
                <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <Calculator className="h-5 w-5" />
                        Resumo Financeiro
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Subtotal (R$)</Label>
                                <Input 
                                    type="number" 
                                    value={subtotal.toFixed(2)}
                                    readOnly
                                    className="bg-gray-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Desconto (R$)</Label>
                                <Input 
                                    type="number" 
                                    step="0.01"
                                    min="0"
                                    value={discount}
                                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Total (R$)</Label>
                            <Input 
                                type="number" 
                                value={total.toFixed(2)}
                                readOnly
                                className="bg-gray-50 text-lg font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Meio de Pagamento</Label>
                            <Select 
                                value={paymentMethod} 
                                onValueChange={setPaymentMethod}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o meio de pagamento" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CASH">Dinheiro</SelectItem>
                                    <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                                    <SelectItem value="DEBIT_CARD">Cartão de Débito</SelectItem>
                                    <SelectItem value="PIX">PIX</SelectItem>
                                    <SelectItem value="BANK_TRANSFER">Transferência Bancária</SelectItem>
                                    <SelectItem value="CHECK">Cheque</SelectItem>
                                    <SelectItem value="OTHER">Outro</SelectItem>
                                </SelectContent>
                            </Select>
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