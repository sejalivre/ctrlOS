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
import {
    Trash2,
    ArrowUpCircle,
    ArrowDownCircle,
    CheckCircle2,
    Clock,
    Edit,
    CreditCard,
    Banknote,
    QrCode
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FinancialDialog } from "@/components/modals/FinancialDialog";
import { Badge } from "@/components/ui/badge";

interface FinancialRecord {
    id: string;
    type: "INCOME" | "EXPENSE";
    category: string;
    description: string;
    amount: number;
    paymentMethod: string | null;
    paid: boolean;
    dueDate: string | null;
    paidAt: string | null;
    createdAt: string;
}

interface FinancialTableProps {
    records: FinancialRecord[];
    onRefresh: () => void;
}

const paymentConfig: any = {
    CASH: { label: "Dinheiro", icon: Banknote, color: "text-green-600" },
    PIX: { label: "PIX", icon: QrCode, color: "text-blue-600" },
    DEBIT_CARD: { label: "Débito", icon: CreditCard, color: "text-slate-600" },
    CREDIT_CARD: { label: "Crédito", icon: CreditCard, color: "text-purple-600" },
    BANK_TRANSFER: { label: "Transf.", icon: Banknote, color: "text-indigo-600" },
    PROMISSORY_NOTE: { label: "Promissória", icon: CreditCard, color: "text-amber-600" },
};

export function FinancialTable({ records, onRefresh }: FinancialTableProps) {
    async function handleDelete(id: string) {
        if (!confirm("Deseja realmente excluir este registro?")) return;

        try {
            const response = await fetch(`/api/financial/${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Erro ao excluir");
            toast.success("Registro excluído!");
            onRefresh();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao excluir registro.");
        }
    }

    return (
        <div className="rounded-md border bg-white overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Categoria / Descrição</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Pagamento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                Nenhum lançamento encontrado.
                            </TableCell>
                        </TableRow>
                    ) : (
                        records.map((record) => {
                            const pm = paymentConfig[record.paymentMethod || ""] || { label: record.paymentMethod || "-", icon: Banknote, color: "" };
                            const Icon = pm.icon;

                            return (
                                <TableRow key={record.id} className="hover:bg-slate-50 transition-colors">
                                    <TableCell>
                                        {record.type === "INCOME" ? (
                                            <ArrowUpCircle className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <ArrowDownCircle className="h-5 w-5 text-red-500" />
                                        )}
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500">
                                        {format(new Date(record.createdAt), "dd/MM/yy", { locale: ptBR })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{record.category}</span>
                                            <span className="text-sm font-medium text-slate-700">{record.description}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`font-black ${record.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                                            {record.type === "EXPENSE" ? "- " : ""}
                                            R$ {Number(record.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {record.paymentMethod ? (
                                            <div className={`flex items-center gap-1 text-xs ${pm.color}`}>
                                                <Icon className="h-3 w-3" />
                                                {pm.label}
                                            </div>
                                        ) : (
                                            <span className="text-slate-300">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {record.paid ? (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                                                <CheckCircle2 className="h-3 w-3 mr-1" /> Pago
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                                                <Clock className="h-3 w-3 mr-1" /> Pendente
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <FinancialDialog
                                                onRefresh={onRefresh}
                                                initialData={record}
                                                trigger={
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                }
                                            />
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                                                onClick={() => handleDelete(record.id)}
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
