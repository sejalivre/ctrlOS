"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ConfirmPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: any;
}

export function ConfirmPaymentModal({ isOpen, onClose, order }: ConfirmPaymentModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: order.totalAmount || 0,
        paymentMethod: order.paymentMethod || "CASH",
        dueDate: format(new Date(), "yyyy-MM-dd"),
        description: `Recebimento OS #${order.orderNumber} - ${order.customer.name}`,
    });

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/financial`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "REVENUE",
                    amount: formData.amount,
                    paymentMethod: formData.paymentMethod,
                    dueDate: new Date(formData.dueDate).toISOString(),
                    description: formData.description,
                    customerId: order.customerId,
                    serviceOrderId: order.id,
                    paid: true,
                    paidAt: new Date().toISOString(),
                }),
            });

            if (!response.ok) throw new Error("Erro ao gerar registro financeiro");

            toast.success("Recebimento confirmado com sucesso!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao confirmar recebimento.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Confirmar Recebimento</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Valor Recebido *</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Data da Compensação *</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="method">Forma de Recebimento *</Label>
                        <Select
                            value={formData.paymentMethod}
                            onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CASH">Dinheiro</SelectItem>
                                <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                                <SelectItem value="DEBIT_CARD">Cartão de Débito</SelectItem>
                                <SelectItem value="PIX">PIX</SelectItem>
                                <SelectItem value="BANK_TRANSFER">Transferência</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="obs">Observações</Label>
                        <Textarea
                            id="obs"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
