"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Loader2, Printer, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BudgetPrintPage() {
    const params = useParams();
    const [budget, setBudget] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const response = await fetch(`/api/budgets/${params.id}`);
                const data = await response.json();
                setBudget(data.budget);
            } catch (error) {
                console.error("Error fetching budget:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBudget();
    }, [params.id]);

    useEffect(() => {
        if (!isLoading && budget) {
            setTimeout(() => {
                window.print();
            }, 800);
        }
    }, [isLoading, budget]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
            </div>
        );
    }

    if (!budget) return <div className="p-8 text-center text-slate-500">Orçamento não encontrado.</div>;

    const validUntilDate = new Date(budget.validUntil);

    return (
        <div className="bg-white text-black p-8 max-w-[210mm] mx-auto min-h-screen print:p-0 font-sans">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                <div className="flex items-center gap-6">
                    <div className="h-20 w-20 bg-slate-950 rounded-xl flex items-center justify-center text-white text-xl font-black">
                        OS
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-950 uppercase">CtrlOS - Assistência Técnica</h1>
                        <p className="text-sm font-medium text-slate-600">Soluções Completas em TI e Eletrônicos</p>
                        <p className="text-xs text-slate-500 mt-1">Rua Exemplo, 123 - Centro, Cidade - UF</p>
                        <p className="text-xs text-slate-500">Tel: (11) 99999-9999 | Email: contato@ctrlos.com</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="bg-slate-950 text-white px-4 py-2 rounded-lg mb-2 inline-block">
                        <h2 className="text-xl font-bold uppercase tracking-widest">Orçamento</h2>
                    </div>
                    <p className="text-lg font-mono font-bold text-slate-900">#{budget.budgetNumber}</p>
                    <p className="text-xs text-slate-500 font-medium">
                        Emissão: {format(new Date(budget.createdAt), "dd/MM/yyyy")}
                    </p>
                </div>
            </div>

            {/* Proposal Content */}
            <div className="mb-8">
                <p className="mb-6 text-slate-700 leading-relaxed">
                    Prezado(a) <span className="font-bold text-slate-900">{budget.customer.name}</span>,<br />
                    Conforme solicitado, apresentamos abaixo nossa proposta comercial para prestação de serviços e/ou fornecimento de produtos.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Informações do Cliente</h3>
                        <p className="text-sm font-bold text-slate-900">{budget.customer.name}</p>
                        <p className="text-xs text-slate-600">{budget.customer.phone || "Telefone não informado"}</p>
                        <p className="text-xs text-slate-600">{budget.customer.email || "E-mail não informado"}</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 relative overflow-hidden">
                        <div className="absolute right-[-10px] top-[-10px] opacity-10">
                            <Clock className="h-12 w-12 text-amber-900" />
                        </div>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-2">Validade da Proposta</h3>
                        <p className="text-sm font-bold text-amber-900">
                            {format(validUntilDate, "dd 'de' MMMM 'de' yyyy")}
                        </p>
                        <p className="text-xs text-amber-700 mt-1">Válido por 15 dias a partir da data de emissão.</p>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm mb-8">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-widest">
                                <th className="px-4 py-3">Item / Descrição</th>
                                <th className="px-4 py-3 text-center w-16">Qtd</th>
                                <th className="px-4 py-3 text-right w-24">Vlr. Unit</th>
                                <th className="px-4 py-3 text-right w-24">Desc.</th>
                                <th className="px-4 py-3 text-right w-24">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {budget.items.map((item: any, index: number) => (
                                <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                                    <td className="px-4 py-4 border-b border-slate-100 font-medium text-slate-800">
                                        {item.description}
                                    </td>
                                    <td className="px-4 py-4 border-b border-slate-100 text-center font-bold text-slate-600">
                                        {item.quantity}
                                    </td>
                                    <td className="px-4 py-4 border-b border-slate-100 text-right text-slate-600">
                                        R$ {item.unitPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-4 border-b border-slate-100 text-right text-red-600 font-medium">
                                        {item.discount > 0 ? `- R$ ${item.discount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "---"}
                                    </td>
                                    <td className="px-4 py-4 border-b border-slate-100 text-right font-bold text-slate-900">
                                        R$ {item.totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-950 text-white font-bold">
                                <td colSpan={4} className="px-4 py-4 text-right uppercase tracking-widest text-xs">Valor Total da Proposta:</td>
                                <td className="px-4 py-4 text-right text-lg font-black tracking-tight">
                                    R$ {budget.totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {budget.notes && (
                    <div className="mb-8 p-6 bg-slate-50 rounded-xl border-l-4 border-slate-900">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Observações Adicionais</h3>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{budget.notes}</p>
                    </div>
                )}
            </div>

            {/* Footer / Terms */}
            <div className="mt-12 pt-8 border-t border-slate-100 text-slate-500">
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div className="text-center pt-8 border-t border-slate-300">
                        <p className="text-xs uppercase font-bold text-slate-400 mb-1">CtrlOS - Assistência Técnica</p>
                        <p className="text-[10px]">Representante Autorizado</p>
                    </div>
                    <div className="text-center pt-8 border-t border-slate-300">
                        <p className="text-xs uppercase font-bold text-slate-400 mb-1">{budget.customer.name}</p>
                        <p className="text-[10px]">Aprovação do Cliente</p>
                    </div>
                </div>

                <div className="text-[9px] text-center leading-relaxed max-w-lg mx-auto italic">
                    <p>Esta proposta comercial está sujeita à disponibilidade de estoque e variação de preços de fornecedores até a data da aprovação. Os prazos de execução serão confirmados no ato da aprovação.</p>
                </div>
            </div>

            {/* Screen Actions */}
            <div className="fixed bottom-8 right-8 flex gap-2 print:hidden">
                <Button onClick={() => window.print()} className="bg-slate-950 hover:bg-slate-800 text-white rounded-full px-6 shadow-2xl">
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir Proposta
                </Button>
            </div>
        </div>
    );
}
