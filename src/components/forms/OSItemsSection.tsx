"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Plus, X, Package, Wrench, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

interface OSItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    totalPrice: number;
    productId?: string | null;
    serviceId?: string | null;
    product?: {
        id: string;
        name: string;
        code: string;
        salePrice: number;
    } | null;
    service?: {
        id: string;
        name: string;
        code: string;
        defaultPrice: number;
    } | null;
}

interface OSItemsSectionProps {
    serviceOrderId: string;
    initialData?: {
        freightAmount: number;
        othersAmount: number;
        discountAmount: number;
    };
    onTotalChange?: (total: number) => void;
}

export default function OSItemsSection({ serviceOrderId, initialData, onTotalChange }: OSItemsSectionProps) {
    const [items, setItems] = useState<OSItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [financials, setFinancials] = useState({
        freightAmount: initialData?.freightAmount || 0,
        othersAmount: initialData?.othersAmount || 0,
        discountAmount: initialData?.discountAmount || 0,
    });

    const [debouncedFinancials] = useDebounce(financials, 1000);

    // Fetch items
    const fetchItems = useCallback(async () => {
        try {
            const response = await fetch(`/api/os/${serviceOrderId}/items`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setItems(data.items || []);
        } catch (error: any) {
            toast.error(error.message || "Erro ao carregar itens");
        } finally {
            setIsLoading(false);
        }
    }, [serviceOrderId]);

    // Sync financials if initialData changes (only on mount or if explicitly different)
    useEffect(() => {
        if (initialData) {
            setFinancials(prev => {
                if (prev.freightAmount === initialData.freightAmount &&
                    prev.othersAmount === initialData.othersAmount &&
                    prev.discountAmount === initialData.discountAmount) {
                    return prev;
                }
                return {
                    freightAmount: initialData.freightAmount,
                    othersAmount: initialData.othersAmount,
                    discountAmount: initialData.discountAmount,
                };
            });
        }
    }, [initialData]);

    // Save financials when they change
    useEffect(() => {
        const saveFinancials = async () => {
            try {
                await fetch(`/api/os/${serviceOrderId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(debouncedFinancials),
                });
            } catch (error) {
                console.error("Error saving financials:", error);
            }
        };

        if (!isLoading) {
            saveFinancials();
        }
    }, [debouncedFinancials, serviceOrderId, isLoading]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // Fetch products for autocomplete
    const fetchProducts = async (search: string): Promise<ComboboxOption[]> => {
        try {
            const response = await fetch(`/api/products?q=${encodeURIComponent(search)}&limit=10`);
            const data = await response.json();
            return (data.products || []).map((p: any) => ({
                value: p.id,
                label: p.name,
                subtitle: `Código: ${p.code} | R$ ${p.salePrice.toFixed(2)}`,
                metadata: { price: p.salePrice, code: p.code },
            }));
        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
    };

    // Fetch services for autocomplete
    const fetchServices = async (search: string): Promise<ComboboxOption[]> => {
        try {
            const response = await fetch(`/api/services?q=${encodeURIComponent(search)}`);
            const data = await response.json();
            return (data.services || []).map((s: any) => ({
                value: s.id,
                label: s.name,
                subtitle: `Código: ${s.code} | R$ ${s.defaultPrice.toFixed(2)}`,
                metadata: { price: s.defaultPrice, code: s.code },
            }));
        } catch (error) {
            console.error("Error fetching services:", error);
            return [];
        }
    };

    // Add product
    const handleAddProduct = async (productId: string, option?: ComboboxOption) => {
        if (!option) return;

        setIsAdding(true);
        try {
            const response = await fetch(`/api/os/${serviceOrderId}/items`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId,
                    description: option.label,
                    quantity: 1,
                    unitPrice: option.metadata.price,
                    discount: 0,
                }),
            });

            if (!response.ok) throw new Error("Erro ao adicionar produto");

            toast.success("Produto adicionado!");
            fetchItems();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsAdding(false);
        }
    };

    // Add service
    const handleAddService = async (serviceId: string, option?: ComboboxOption) => {
        if (!option) return;

        setIsAdding(true);
        try {
            const response = await fetch(`/api/os/${serviceOrderId}/items`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    serviceId,
                    description: option.label,
                    quantity: 1,
                    unitPrice: option.metadata.price,
                    discount: 0,
                }),
            });

            if (!response.ok) throw new Error("Erro ao adicionar serviço");

            toast.success("Serviço adicionado!");
            fetchItems();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsAdding(false);
        }
    };

    // Update item quantity or discount
    const handleUpdateItem = async (itemId: string, quantity: number, discount: number) => {
        if (quantity < 1) return;

        try {
            const response = await fetch(`/api/os/${serviceOrderId}/items/${itemId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity, discount }),
            });

            if (!response.ok) throw new Error("Erro ao atualizar item");

            fetchItems();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Remove item
    const handleRemoveItem = async (itemId: string) => {
        try {
            const response = await fetch(`/api/os/${serviceOrderId}/items/${itemId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Erro ao remover item");

            toast.success("Item removido!");
            fetchItems();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const productItems = items.filter(item => item.productId);
    const serviceItems = items.filter(item => item.serviceId);
    const totalProducts = productItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalServices = serviceItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalAmount = totalProducts + totalServices + financials.freightAmount + financials.othersAmount - financials.discountAmount;

    // Notify parent of total change
    useEffect(() => {
        onTotalChange?.(totalAmount);
    }, [totalAmount, onTotalChange]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Produtos/Peças */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Produtos/Peças
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Combobox
                            placeholder="Buscar produto..."
                            searchPlaceholder="Digite para buscar..."
                            emptyText="Nenhum produto encontrado"
                            fetchOptions={fetchProducts}
                            onValueChange={handleAddProduct}
                            disabled={isAdding}
                            className="flex-1"
                        />
                    </div>

                    {productItems.length > 0 && (
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produto</TableHead>
                                        <TableHead className="w-[80px]">Quant.</TableHead>
                                        <TableHead className="w-[120px]">Desconto</TableHead>
                                        <TableHead className="w-[120px]">Valor Unit.</TableHead>
                                        <TableHead className="w-[120px]">Subtotal</TableHead>
                                        <TableHead className="w-[60px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {productItems.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{item.description}</p>
                                                    {item.product && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Código: {item.product.code}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleUpdateItem(item.id, parseInt(e.target.value) || 1, item.discount)}
                                                    className="w-[70px]"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-2.5 text-xs text-muted-foreground">R$</span>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.discount}
                                                        onChange={(e) => handleUpdateItem(item.id, item.quantity, parseFloat(e.target.value) || 0)}
                                                        className="pl-7 w-[100px]"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                R$ {item.unitPrice.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                R$ {item.totalPrice.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Serviços/Mão de obra */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        Serviços/Mão de obra
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Combobox
                            placeholder="Buscar serviço..."
                            searchPlaceholder="Digite para buscar..."
                            emptyText="Nenhum serviço encontrado"
                            fetchOptions={fetchServices}
                            onValueChange={handleAddService}
                            disabled={isAdding}
                            className="flex-1"
                        />
                    </div>

                    {serviceItems.length > 0 && (
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Serviço</TableHead>
                                        <TableHead className="w-[80px]">Quant.</TableHead>
                                        <TableHead className="w-[120px]">Desconto</TableHead>
                                        <TableHead className="w-[120px]">Valor Unit.</TableHead>
                                        <TableHead className="w-[120px]">Subtotal</TableHead>
                                        <TableHead className="w-[60px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {serviceItems.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{item.description}</p>
                                                    {item.service && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Código: {item.service.code}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleUpdateItem(item.id, parseInt(e.target.value) || 1, item.discount)}
                                                    className="w-[70px]"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-2.5 text-xs text-muted-foreground">R$</span>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.discount}
                                                        onChange={(e) => handleUpdateItem(item.id, item.quantity, parseFloat(e.target.value) || 0)}
                                                        className="pl-7 w-[100px]"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                R$ {item.unitPrice.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                R$ {item.totalPrice.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Total */}
            <Card>
                <CardHeader>
                    <CardTitle>Total</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Mão de obra</label>
                            <Input value={`R$ ${totalServices.toFixed(2)}`} readOnly className="bg-slate-50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Peças</label>
                            <Input value={`R$ ${totalProducts.toFixed(2)}`} readOnly className="bg-slate-50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Frete</label>
                            <Input
                                type="number"
                                step="0.01"
                                value={financials.freightAmount}
                                onChange={(e) => setFinancials(prev => ({ ...prev, freightAmount: parseFloat(e.target.value) || 0 }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Outros</label>
                            <Input
                                type="number"
                                step="0.01"
                                value={financials.othersAmount}
                                onChange={(e) => setFinancials(prev => ({ ...prev, othersAmount: parseFloat(e.target.value) || 0 }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Desconto Geral</label>
                            <Input
                                type="number"
                                step="0.01"
                                value={financials.discountAmount}
                                onChange={(e) => setFinancials(prev => ({ ...prev, discountAmount: parseFloat(e.target.value) || 0 }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-900">Valor total</label>
                            <div className="h-10 px-3 py-2 rounded-md border border-input bg-slate-900 text-white font-bold flex items-center justify-center">
                                R$ {totalAmount.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
