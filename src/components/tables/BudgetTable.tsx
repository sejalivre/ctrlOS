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
import { BudgetDialog } from "@/components/modals/BudgetDialog";
import { Trash2, CheckCircle2, XCircle, Clock, RefreshCw, Printer, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BudgetItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productId?: string | null;
    serviceId?: string | null;
}

interface Budget {
    id: string;
    budgetNumber: string;
    customerId: string;
    customer: { name: string };
    status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "CONVERTED";
    totalAmount: number;
    validUntil: string;
    createdAt: string;
    items?: BudgetItem[];
    notes?: string;
}

interface BudgetTableProps {
    budgets: Budget[];
    onRefresh: () => void;
}

const statusConfig = {
    PENDING: { label: "Pendente", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
    APPROVED: { label: "Aprovado", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
    REJECTED: { label: "Recusado", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
    EXPIRED: { label: "Expirado", color: "bg-slate-100 text-slate-700 border-slate-200", icon: Clock },
    CONVERTED: { label: "Convertido", color: "bg-blue-100 text-blue-700 border-blue-200", icon: RefreshCw },
};

export function BudgetTable({ budgets, onRefresh }: BudgetTableProps) {
    const router = useRouter();

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir este orçamento?")) return;

        try {
            const response = await fetch(`/api/budgets/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Erro ao excluir orçamento");

            toast.success("Orçamento excluído!");
            onRefresh();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao excluir orçamento.");
        }
    }

    async function handleConvertToSale(id: string) {
        if (!confirm("Deseja converter este orçamento em uma Venda? Isso dará baixa no estoque e registrará a entrada no financeiro.")) return;

        try {
            const response = await fetch(`/api/budgets/${id}/convertToSale`, {
                method: "POST",
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Erro ao converter para Venda");

            toast.success("Orçamento convertido em Venda com sucesso!");
            onRefresh();

            // Redirect to sales page
            router.push("/sales");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Erro ao converter para Venda.");
        }
    }

    async function handleConvertToOS(id: string) {
        if (!confirm("Deseja converter este orçamento em uma Ordem de Serviço?")) return;

        try {
            const response = await fetch(`/api/budgets/${id}/convert`, {
                method: "POST",
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Erro ao converter para OS");

            toast.success("Orçamento convertido com sucesso!");
            onRefresh();

            // Redirect to the new OS page
            if (data.osId) {
                router.push(`/os/${data.osId}`);
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Erro ao converter para OS.");
        }
    }

    return (
        <div className="rounded-md border bg-white overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nº Orçamento</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Validade</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {budgets.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                Nenhum orçamento encontrado.
                            </TableCell>
                        </TableRow>
                    ) : (
                        budgets.map((budget) => {
                            const config = statusConfig[budget.status];
                            const StatusIcon = config.icon;

                            return (
                                <TableRow key={budget.id} className="hover:bg-slate-50 transition-colors">
                                    <TableCell className="font-mono text-xs font-bold">{budget.budgetNumber}</TableCell>
                                    <TableCell className="font-medium">{budget.customer.name}</TableCell>
                                    <TableCell className="font-bold text-green-600">
                                        R$ {Number(budget.totalAmount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell>
                                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
                                            <StatusIcon className="h-3 w-3 mr-1" />
                                            {config.label}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {format(new Date(budget.validUntil), "dd MMM yyyy", { locale: ptBR })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            {budget.status === "PENDING" && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-green-600 border-green-200 hover:bg-green-50"
                                                        title="Converter para OS"
                                                        onClick={() => handleConvertToOS(budget.id)}
                                                    >
                                                        <RefreshCw className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                        title="Converter para Venda"
                                                        onClick={() => handleConvertToSale(budget.id)}
                                                    >
                                                        <ShoppingCart className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-slate-600 border-slate-200 hover:bg-slate-50"
                                                title="Imprimir"
                                                onClick={() => window.open(`/budgets/${budget.id}/print`, '_blank')}
                                            >
                                                <Printer className="h-4 w-4" />
                                            </Button>
                                            <BudgetDialog
                                                initialData={budget}
                                                onRefresh={onRefresh}
                                            />
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                title="Excluir"
                                                onClick={() => handleDelete(budget.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
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
