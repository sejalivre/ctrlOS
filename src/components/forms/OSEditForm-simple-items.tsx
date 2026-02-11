"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Combobox } from "@/components/ui/combobox";

interface ServiceOrderFormData {
  customerId: string;
  technicianId?: string;
  priority: string;
  status: string;
  equipments: Array<{
    type: string;
    brand: string;
    model: string;
    reportedIssue: string;
    diagnosis: string;
    solution: string;
    accessories?: string;
    observations?: string;
  }>;
  items?: Array<{
    productId?: string;
    serviceId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    totalPrice: number;
  }>;
  paymentMethod?: string;
  totalAmount?: number;
}

interface OSItemRowProps {
  index: number;
  form: any;
  onRemove: (index: number) => void;
  onChange: (index: number, field: string, value: any) => void;
  fetchOptions: (search: string) => Promise<any[]>;
}

const OSItemRow = React.memo(({ index, form, onRemove, onChange, fetchOptions }: OSItemRowProps) => {
  // Use useWatch for better reactivity within the memoized row
  const itemData = useWatch({
    control: form.control,
    name: `items.${index}`,
  });

  const { productId, serviceId, description, quantity, unitPrice, discount, totalPrice } = itemData || {};

  // The value for the combobox is either the productId or serviceId
  const comboboxValue = productId ? `prod_${productId}` : serviceId ? `serv_${serviceId}` : "";

  return (
    <div className="grid grid-cols-[2fr_1fr_80px_120px_100px_120px_50px] gap-2 items-center border-b py-2 text-sm hover:bg-gray-50 transition-colors">
      {/* Produto/Busca */}
      <div className="px-1">
        <Combobox
          fetchOptions={fetchOptions}
          value={comboboxValue}
          valueLabel={description}
          placeholder="Digite para buscar..."
          className="h-9 text-xs"
          onValueChange={(val, option) => {
            if (option && option.metadata) {
              const meta = option.metadata;
              form.setValue(`items.${index}.description`, meta.name);
              form.setValue(`items.${index}.unitPrice`, meta.price);
              const q = form.getValues(`items.${index}.quantity`) || 1;
              const d = form.getValues(`items.${index}.discount`) || 0;
              form.setValue(`items.${index}.totalPrice`, (meta.price * q) - d);
              if (meta.type === 'PRODUCT') {
                form.setValue(`items.${index}.productId`, meta.id);
                form.setValue(`items.${index}.serviceId`, undefined);
              } else {
                form.setValue(`items.${index}.serviceId`, meta.id);
                form.setValue(`items.${index}.productId`, undefined);
              }
            } else if (val === "") {
              // Clear item
              form.setValue(`items.${index}.productId`, undefined);
              form.setValue(`items.${index}.serviceId`, undefined);
              form.setValue(`items.${index}.description`, "");
              form.setValue(`items.${index}.unitPrice`, 0);
              form.setValue(`items.${index}.totalPrice`, 0);
            }
          }}
        />
      </div>

      {/* Detalhes/Descrição */}
      <div className="px-1">
        <Input
          value={description || ""}
          onChange={(e) => onChange(index, "description", e.target.value)}
          placeholder="Descrição"
          className="h-9 text-xs"
        />
      </div>

      {/* Quantidade */}
      <div className="px-1">
        <Input
          type="number"
          min="1"
          step="1"
          value={quantity || 1}
          onChange={(e) => onChange(index, "quantity", e.target.value)}
          className="h-9 text-xs px-2"
        />
      </div>

      {/* Valor Unitário */}
      <div className="px-1">
        <div className="relative">
          <span className="absolute left-2 top-2.5 text-[10px] text-gray-400">R$</span>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={unitPrice || 0}
            onChange={(e) => onChange(index, "unitPrice", e.target.value)}
            className="h-9 text-xs pl-7"
          />
        </div>
      </div>

      {/* Desconto */}
      <div className="px-1">
        <div className="relative">
          <span className="absolute left-2 top-2.5 text-[10px] text-gray-400">R$</span>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={discount || 0}
            onChange={(e) => onChange(index, "discount", e.target.value)}
            className="h-9 text-xs pl-7 text-red-600 font-medium"
          />
        </div>
      </div>

      {/* Subtotal */}
      <div className="px-1">
        <div className="relative">
          <span className="absolute left-2 top-2.5 text-[10px] text-gray-400">R$</span>
          <Input
            type="number"
            value={(totalPrice || 0).toFixed(2)}
            readOnly
            className="h-9 text-xs pl-7 bg-gray-50 font-bold border-none shadow-none"
          />
        </div>
      </div>

      {/* Ação */}
      <div className="px-1 flex justify-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if index changes
  // We rely on RHF watch() but we need to ensure the parent doesn't block re-renders
  // Actually, let's remove the custom comparison and let React handle it if props change.
  // But wait, props don't change here if we use watch inside.
  // Actually, the most reliable way to fix "cannot edit" is to allow it to re-render.
  return prevProps.index === nextProps.index &&
    prevProps.form === nextProps.form;
});

interface OSEditFormSimpleItemsProps {
  orderId: string;
  initialData?: any;
  onSuccess?: () => void;
}

export default function OSEditFormSimpleItems({ orderId, initialData, onSuccess }: OSEditFormSimpleItemsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [technicians, setTechnicians] = useState<{ id: string; name: string }[]>([]);

  const form = useForm<ServiceOrderFormData>({
    defaultValues: initialData ? {
      customerId: initialData.customerId || "",
      technicianId: initialData.technicianId || "",
      priority: initialData.priority || "NORMAL",
      status: initialData.status || "OPENED",
      equipments: initialData.equipments?.length > 0 ? initialData.equipments.map((eq: any) => ({
        type: eq.type || "",
        reportedIssue: eq.reportedIssue || "",
        brand: eq.brand || "",
        model: eq.model || "",
        diagnosis: eq.diagnosis || "",
        solution: eq.solution || "",
        accessories: eq.accessories || "",
        observations: eq.observations || "",
      })) : [{
        type: "",
        reportedIssue: "",
        brand: "",
        model: "",
        diagnosis: "",
        solution: "",
        accessories: "",
        observations: "",
      }],
      items: initialData.items?.length > 0 ? initialData.items.map((item: any) => ({
        productId: item.productId || undefined,
        serviceId: item.serviceId || undefined,
        description: item.description || "",
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        discount: item.discount || 0,
        totalPrice: item.totalPrice || 0,
      })) : [],
      paymentMethod: initialData.paymentMethod || "",
      totalAmount: initialData.totalAmount || 0,
    } : {
      customerId: "",
      technicianId: "",
      priority: "NORMAL",
      status: "OPENED",
      equipments: [{
        type: "",
        reportedIssue: "",
        brand: "",
        model: "",
        diagnosis: "",
        solution: "",
        accessories: "",
        observations: "",
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

  // Fetch customers and technicians
  useEffect(() => {
    async function fetchData() {
      try {
        const [custRes, techRes] = await Promise.all([
          fetch("/api/customers?limit=100"),
          fetch("/api/users?role=TECHNICIAN&active=true")
        ]);

        if (custRes.ok) {
          const data = await custRes.json();
          setCustomers(data.customers || []);
        }

        if (techRes.ok) {
          const data = await techRes.json();
          setTechnicians(data.users || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  // Use useWatch for items to ensure the grand total is updated on any deep change
  const watchedItems = useWatch({
    control: form.control,
    name: "items",
  });

  const subtotal = useMemo(() => {
    return (watchedItems || []).reduce((sum: number, item: any) => {
      const price = Number(item.totalPrice) || 0;
      return sum + price;
    }, 0);
  }, [watchedItems]);

  useEffect(() => {
    form.setValue("totalAmount", subtotal);
  }, [subtotal, form]);

  // Function to fetch products and services for autocomplete
  const fetchItemOptions = useCallback(async (search: string) => {
    if (search.length < 2) return [];

    try {
      const [prodRes, servRes] = await Promise.all([
        fetch(`/api/products?q=${search}&limit=5`),
        fetch(`/api/services?q=${search}&limit=5`)
      ]);

      const prodData = await prodRes.json();
      const servData = await servRes.json();

      const prodOptions = (prodData.products || []).map((p: any) => ({
        value: `prod_${p.id}`,
        label: p.name,
        subtitle: `Produto - R$ ${p.salePrice.toFixed(2)}`,
        metadata: { type: 'PRODUCT', id: p.id, price: p.salePrice, name: p.name }
      }));

      const servOptions = (servData.services || []).map((s: any) => ({
        value: `serv_${s.id}`,
        label: s.name,
        subtitle: `Serviço - R$ ${s.defaultPrice.toFixed(2)}`,
        metadata: { type: 'SERVICE', id: s.id, price: s.defaultPrice, name: s.name }
      }));

      return [...prodOptions, ...servOptions];
    } catch (error) {
      console.error("Error fetching item options:", error);
      return [];
    }
  }, []);

  // Handle item changes for auto-calculation
  const handleItemChange = useCallback((index: number, field: string, value: any) => {
    const items = form.getValues("items") || [];
    const item = items[index];

    if (!item) return;

    const updatedItem = { ...item, [field]: value };

    // Calculate total price if quantity, unit price or discount changes
    if (field === "quantity" || field === "unitPrice" || field === "discount") {
      const q = field === "quantity" ? Number(value) : (item.quantity || 1);
      const p = field === "unitPrice" ? Number(value) : (item.unitPrice || 0);
      const d = field === "discount" ? Number(value) : (item.discount || 0);
      updatedItem.totalPrice = (q * p) - d;
    }

    // Update the item in the form
    form.setValue(`items.${index}`, updatedItem);
  }, [form]);

  async function onSubmit(data: ServiceOrderFormData) {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/os/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: data.customerId,
          technicianId: data.technicianId,
          priority: data.priority,
          status: data.status,
          equipments: data.equipments,
          items: data.items,
          totalAmount: data.totalAmount,
          paymentMethod: data.paymentMethod,
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

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value: any) => form.setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPENED">Aberta</SelectItem>
                  <SelectItem value="IN_PROGRESS">Em Manutenção</SelectItem>
                  <SelectItem value="AWAITING_PARTS">Aguardando Peça</SelectItem>
                  <SelectItem value="READY">Pronta para Entrega</SelectItem>
                  <SelectItem value="DELIVERED">Entregue</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Técnico Responsável</Label>
              <Select
                value={form.watch("technicianId") || ""}
                onValueChange={(value) => form.setValue("technicianId", value)}
              >
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Acessórios (Carregador, Cabos...)</Label>
                    <Input
                      {...form.register(`equipments.${index}.accessories`)}
                      placeholder="ex: Carregador, Cabo HDMI"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Condições (Arranhado, Quebrado...)</Label>
                    <Input
                      {...form.register(`equipments.${index}.observations`)}
                      placeholder="ex: Arranhado na tampa"
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
              diagnosis: "",
              solution: "",
            })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Outro Equipamento
          </Button>
        </CardContent>
      </Card>

      {/* Itens Simples (Table Layout) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-bold flex items-center">
            <Plus className="h-5 w-5 mr-2" /> Produtos/Peças e Serviços
          </CardTitle>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => appendItem({
              description: "",
              quantity: 1,
              unitPrice: 0,
              discount: 0,
              totalPrice: 0,
            })}
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4 mr-2" /> Adicionar produto
          </Button>
        </CardHeader>
        <CardContent>
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1fr_80px_120px_100px_120px_50px] gap-2 border-y py-2 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <div className="px-2">Produto*</div>
            <div className="px-1">Detalhes</div>
            <div className="px-1">Quant.*</div>
            <div className="px-1">Valor*</div>
            <div className="px-1 text-red-500">Desconto</div>
            <div className="px-1">Subtotal</div>
            <div className="px-1 text-center">Ação</div>
          </div>

          <div className="min-h-[50px]">
            {itemFields.map((field, index) => (
              <OSItemRow
                key={field.id}
                index={index}
                form={form}
                onRemove={removeItem}
                onChange={handleItemChange}
                fetchOptions={fetchItemOptions}
              />
            ))}
            {itemFields.length === 0 && (
              <div className="py-8 text-center text-gray-400 text-sm">
                Nenhum item adicionado. Clique acima para começar.
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 min-w-[250px] space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Subtotal de Itens:</span>
                <span className="font-medium text-slate-700">R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-slate-200">
                <span className="text-slate-900 uppercase text-xs tracking-widest">Total Geral:</span>
                <span className="text-slate-900">R$ {subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Método de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle>Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              value={subtotal.toFixed(2)}
              readOnly
              className="bg-gray-50 font-bold text-lg"
            />
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