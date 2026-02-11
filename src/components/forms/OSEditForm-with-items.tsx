"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, Calculator } from "lucide-react";

interface ServiceOrderFormData {
  customerId: string;
  priority: string;
  status: string;
  equipments: Array<{
    type: string;
    brand: string;
    model: string;
    serialNumber: string;
    reportedIssue: string;
    diagnosis: string;
    solution: string;
    accessories: string;
    observations: string;
  }>;
  items?: Array<{
    productId?: string;
    serviceId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  paymentMethod?: string;
  totalAmount?: number;
}

interface OSEditFormWithItemsProps {
  orderId: string;
  initialData?: any;
  onSuccess?: () => void;
}

export default function OSEditFormWithItems({ orderId, initialData, onSuccess }: OSEditFormWithItemsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; price: number; stock: number }[]>([]);
  const [services, setServices] = useState<{ id: string; name: string; price: number }[]>([]);
  const [calculations, setCalculations] = useState({
    subtotal: 0,
    total: 0,
  });

  const form = useForm<ServiceOrderFormData>({
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
        solution: eq.solution || "",
      })) : [{
        type: "",
        reportedIssue: "",
        brand: "",
        model: "",
        serialNumber: "",
        accessories: "",
        observations: "",
        diagnosis: "",
        solution: "",
      }],
      items: initialData.items?.length > 0 ? initialData.items.map((item: any) => ({
        productId: item.productId || "",
        serviceId: item.serviceId || "",
        description: item.description || "",
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        totalPrice: item.totalPrice || 0,
      })) : [],
      paymentMethod: initialData.paymentMethod || "",
      totalAmount: initialData.totalAmount || 0,
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
        solution: "",
      }],
      items: [],
      paymentMethod: "",
      totalAmount: 0,
    },
  });

  const { fields: equipmentFields, append: appendEquipment, remove: removeEquipment } = useFieldArray({
    control: form.control,
    name: "equipments",
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Fetch customers, products, and services
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch customers
        const customersRes = await fetch("/api/customers?limit=100");
        if (customersRes.ok) {
          const data = await customersRes.json();
          setCustomers(data.customers || []);
        }

        // Fetch products
        const productsRes = await fetch("/api/products?limit=100");
        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data.products || []);
        }

        // Fetch services
        const servicesRes = await fetch("/api/services?limit=100");
        if (servicesRes.ok) {
          const data = await servicesRes.json();
          setServices(data.services || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  // Calculate totals when items change
  useEffect(() => {
    const items = form.watch("items") || [];
    const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    
    setCalculations({
      subtotal,
      total: subtotal,
    });

    // Update form values
    form.setValue("totalAmount", subtotal);
  }, [form.watch("items")]);

  // Handle item changes for auto-calculation
  const handleItemChange = (index: number, field: string, value: any) => {
    const items = form.getValues("items") || [];
    const item = items[index];
    
    if (!item) return;

    const updatedItem = { ...item, [field]: value };

    // Calculate total price if quantity or unit price changes
    if (field === "quantity" || field === "unitPrice") {
      const quantity = field === "quantity" ? Number(value) : item.quantity;
      const unitPrice = field === "unitPrice" ? Number(value) : item.unitPrice;
      updatedItem.totalPrice = quantity * unitPrice;
    }

    // Update the item in the form
    form.setValue(`items.${index}`, updatedItem);
  };

  // Handle product selection
  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.productId`, productId);
      form.setValue(`items.${index}.description`, product.name);
      form.setValue(`items.${index}.unitPrice`, product.price);
      form.setValue(`items.${index}.totalPrice`, product.price * (form.getValues(`items.${index}.quantity`) || 1));
    }
  };

  // Handle service selection
  const handleServiceSelect = (index: number, serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      form.setValue(`items.${index}.serviceId`, serviceId);
      form.setValue(`items.${index}.description`, service.name);
      form.setValue(`items.${index}.unitPrice`, service.price);
      form.setValue(`items.${index}.totalPrice`, service.price * (form.getValues(`items.${index}.quantity`) || 1));
    }
  };

  async function onSubmit(data: ServiceOrderFormData) {
    console.log("Form submitted with data:", data);
    setIsSaving(true);
    try {
      const response = await fetch(`/api/os/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: data.customerId,
          priority: data.priority,
          status: data.status,
          equipments: data.equipments,
          items: data.items,
          totalAmount: data.totalAmount,
          paymentMethod: data.paymentMethod,
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
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select 
                value={form.watch("customerId")} 
                onValueChange={(value) => form.setValue("customerId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select 
                value={form.watch("priority")} 
                onValueChange={(value: string) => form.setValue("priority", value)}
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
        </CardContent>
      </Card>

      {/* Equipamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Equipamentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {equipmentFields.map((field, index) => (
            <Card key={field.id} className="border">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Equipamento #{index + 1}</h3>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEquipment(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Tipo *</Label>
                    <Input 
                      {...form.register(`equipments.${index}.type`)} 
                      placeholder="ex: Notebook, PC"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Marca</Label>
                    <Input 
                      {...form.register(`equipments.${index}.brand`)} 
                      placeholder="ex: Dell, Samsung"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Modelo</Label>
                    <Input 
                      {...form.register(`equipments.${index}.model`)} 
                      placeholder="ex: Inspiron 15"
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <Label>Problema Relatado *</Label>
                  <Textarea 
                    {...form.register(`equipments.${index}.reportedIssue`)} 
                    placeholder="Descreva o problema relatado pelo cliente"
                    className="min-h-[80px]"
                  />
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

          <Button
            type="button"
            variant="outline"
            onClick={() => appendEquipment({
              type: "",
              reportedIssue: "",
              brand: "",
              model: "",
              serialNumber: "",
              accessories: "",
              observations: "",
              diagnosis: "",
              solution: "",
            })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Outro Equipamento
          </Button>
        </CardContent>
      </Card>

      {/* Produtos e Serviços */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos e Serviços</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {itemFields.map((field, index) => (
            <Card key={field.id} className="border">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Item #{index + 1}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Produto</Label>
                    <Select 
                      value={form.watch(`items.${index}.productId`) || ""}
                      onValueChange={(value) => handleProductSelect(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - R$ {product.price.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Serviço</Label>
                    <Select 
                      value={form.watch(`items.${index}.serviceId`) || ""}
                      onValueChange={(value) => handleServiceSelect(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - R$ {service.price.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <Label>Descrição *</Label>
                  <Input 
                    value={form.watch(`items.${index}.description`) || ""}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    placeholder="Descrição do item"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Quantidade</Label>
                    <Input 
                      type="number"
                      min="1"
                      value={form.watch(`items.${index}.quantity`) || 1}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Preço Unitário (R$)</Label>
                    <Input 
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.watch(`items.${index}.unitPrice`) || 0}
                      onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Total (R$)</Label>
                    <Input 
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.watch(`items.${index}.totalPrice`) || 0}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => appendItem({
              productId: "",
              serviceId: "",
              description: "",
              quantity: 1,
              unitPrice: 0,
              totalPrice: 0,
            })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Item
          </Button>
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Método de Pagamento</Label>
              <Select 
                value={form.watch("paymentMethod") || ""}
                onValueChange={(value) => form.setValue("paymentMethod", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método de pagamento" />
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

            <div className="space-y-2">
              <Label>Total da OS (R$)</Label>
              <Input 
                type="number"
                min="0"
                step="0.01"
                value={calculations.total.toFixed(2)}
                readOnly
                className="bg-gray-50 font-bold text-lg"
              />
              <p className="text-sm text-gray-500">
                Subtotal: R$ {calculations.subtotal.toFixed(2)}
              </p>
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