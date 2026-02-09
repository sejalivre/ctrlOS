"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag, User as UserIcon, CreditCard, Banknote, QrCode } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Sale {
    id: string;
    saleNumber: string;
    customerId: string | null;
    customer: { name: string } | null;
    sellerId: string;
    seller: { name: string | null };
    totalAmount: number;
    paymentMethod: "CASH" | "DEBIT_CARD" | "CREDIT_CARD" | "PIX" | "BANK_TRANSFER" | "PROMISSORY_NOTE";
    paid: boolean;
    createdAt: string;
}

interface SaleTableProps {
    sales: Sale[];
    onRefresh: () => void;
}

const paymentConfig = {
    CASH: { label: "Dinheiro", icon: Banknote, color: "text-green-600" },
    PIX: { label: "PIX", icon: QrCode, color: "text-blue-600" },
    DEBIT_CARD: { label: "Débito", icon: CreditCard, color: "text-slate-600" },
    CREDIT_CARD: { label: "Crédito", icon: CreditCard, color: "text-purple-600" },
    BANK_TRANSFER: { label: "Transf.", icon: Banknote, color: "text-indigo-600" },
    PROMISSORY_NOTE: { label: "Promissória", icon: ShoppingBag, color: "text-amber-600" },
};

export function SaleTable({ sales, onRefresh }: SaleTableProps) {
    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja cancelar esta venda? O estoque será restaurado.")) return;

        try {
            const response = await fetch(`/api/sales/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Erro ao excluir venda");

            toast.success("Venda cancelada!");
            onRefresh();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao cancelar venda.");
        }
    }

    return (
        <div className="rounded-md border bg-white overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead>Nº Venda</TableHead>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Vendedor</TableHead>
                        <TableHead>Pagamento</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sales.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                Nenhuma venda registrada ainda.
                            </TableCell>
                        </TableRow>
                    ) : (
                        sales.map((sale) => {
                            const pm = paymentConfig[sale.paymentMethod] || { label: sale.paymentMethod, icon: Banknote, color: "" };
                            const Icon = pm.icon;

                            return (
                                <TableRow key={sale.id} className="hover:bg-slate-50 transition-colors">
                                    <TableCell className="font-mono text-xs font-bold text-slate-600">{sale.saleNumber}</TableCell>
                                    <TableCell className="text-sm">
                                        {format(new Date(sale.createdAt), "dd/MM/yy HH:mm", { locale: ptBR })}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {sale.customer ? sale.customer.name : <span className="text-slate-400 italic">Venda Balcão</span>}
                                    </TableCell>
                                    <TableCell className="text-sm flex items-center gap-1 text-slate-600">
                                        <UserIcon className="h-3 w-3" />
                                        {sale.seller.name || "Sistema"}
                                    </TableCell>
                                    <TableCell>
                                        <div className={`flex items-center gap-1.5 text-xs font-bold ${pm.color}`}>
                                            <Icon className="h-3.5 w-3.5" />
                                            {pm.label}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-black text-slate-900">
                                        R$ {Number(sale.totalAmount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDelete(sale.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
