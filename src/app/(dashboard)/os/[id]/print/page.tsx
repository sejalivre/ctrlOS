"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OSPrintPage() {
    const params = useParams();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(`/api/os/${params.id}`);
                const data = await response.json();
                setOrder(data.order);
            } catch (error) {
                console.error("Error fetching order:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [params.id]);

    useEffect(() => {
        if (!isLoading && order) {
            // Auto print when loaded
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [isLoading, order]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
            </div>
        );
    }

    if (!order) return <div className="p-8 text-center">Ordem de serviço não encontrada.</div>;

    return (
        <div className="bg-white text-black p-8 max-w-[210mm] mx-auto min-h-screen print:p-0">
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-6 mb-6">
                <div className="flex items-center gap-4">
                    {/* Placeholder for Logo */}
                    <div className="h-16 w-16 bg-slate-200 rounded flex items-center justify-center text-slate-500 text-xs font-bold">
                        LOGO
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">CtrlOS - Assistência Técnica</h1>
                        <p className="text-sm text-gray-600">Rua Exemplo, 123 - Centro, Cidade - UF</p>
                        <p className="text-sm text-gray-600">Tel: (11) 99999-9999 | Email: contato@ctrlos.com</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                        OS #{String(order.orderNumber).padStart(4, '0')}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Emissão: {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                </div>
            </div>

            {/* Customer Info */}
            <div className="border rounded-md p-4 mb-6">
                <h3 className="text-sm font-bold uppercase text-gray-500 mb-2">Dados do Cliente</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-semibold">Nome:</span> {order.customer.name}
                    </div>
                    <div>
                        <span className="font-semibold">Telefone:</span> {order.customer.phone || "---"}
                    </div>
                    <div>
                        <span className="font-semibold">Email:</span> {order.customer.email || "---"}
                    </div>
                    <div>
                        <span className="font-semibold">Endereço:</span> {order.customer.address || "---"}
                    </div>
                </div>
            </div>

            {/* Equipments */}
            <div className="mb-6">
                <h3 className="text-sm font-bold uppercase text-gray-500 mb-2 border-b pb-1">Equipamentos e Serviços</h3>

                {order.equipments.map((eq: any, text: number) => (
                    <div key={eq.id} className="mb-4 p-4 bg-gray-50 rounded-md border break-inside-avoid">
                        <div className="font-bold text-lg mb-2">
                            {eq.type} {eq.brand} {eq.model}
                            {eq.serialNumber && <span className="text-sm font-normal text-gray-600 ml-2">(S/N: {eq.serialNumber})</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                            <div>
                                <span className="font-semibold block text-gray-600">Problema Relatado:</span>
                                {eq.reportedIssue}
                            </div>
                            <div>
                                <span className="font-semibold block text-gray-600">Diagnóstico Técnico:</span>
                                {eq.diagnosis || "---"}
                            </div>
                        </div>

                        {eq.accessories && (
                            <div className="text-sm mb-2">
                                <span className="font-semibold text-gray-600">Acessórios:</span> {eq.accessories}
                            </div>
                        )}

                        {eq.solution && (
                            <div className="mt-2 text-sm border-t pt-2">
                                <span className="font-semibold text-gray-600">Solução Realizada:</span> {eq.solution}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Financial Summary */}
            <div className="flex justify-end mb-8 break-inside-avoid">
                <div className="w-1/2">
                    <table className="w-full text-sm">
                        <tbody>
                            <tr>
                                <td className="py-1 text-gray-600">Total Produtos/Peças:</td>
                                <td className="py-1 text-right">R$ {order.productsAmount?.toFixed(2) || "0.00"}</td>
                            </tr>
                            <tr>
                                <td className="py-1 text-gray-600">Total Serviços/Mão de Obra:</td>
                                <td className="py-1 text-right">R$ {order.servicesAmount?.toFixed(2) || "0.00"}</td>
                            </tr>
                            {order.freightAmount > 0 && (
                                <tr>
                                    <td className="py-1 text-gray-600">Frete:</td>
                                    <td className="py-1 text-right">R$ {order.freightAmount.toFixed(2)}</td>
                                </tr>
                            )}
                            {order.othersAmount > 0 && (
                                <tr>
                                    <td className="py-1 text-gray-600">Outras Despesas:</td>
                                    <td className="py-1 text-right">R$ {order.othersAmount.toFixed(2)}</td>
                                </tr>
                            )}
                            {order.discountAmount > 0 && (
                                <tr>
                                    <td className="py-1 text-gray-600">Desconto:</td>
                                    <td className="py-1 text-right text-red-600">- R$ {order.discountAmount.toFixed(2)}</td>
                                </tr>
                            )}
                            <tr className="border-t border-black font-bold text-lg">
                                <td className="py-2">TOTAL DA ORDEM DE SERVIÇO:</td>
                                <td className="py-2 text-right">R$ {order.totalAmount?.toFixed(2) || "0.00"}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-12 mt-16 break-inside-avoid">
                <div className="text-center">
                    <div className="border-t border-black pt-2">
                        Assinatura do Técnico
                    </div>
                </div>
                <div className="text-center">
                    <div className="border-t border-black pt-2">
                        Assinatura do Cliente
                    </div>
                </div>
            </div>

            {/* Terms / Footer */}
            <div className="mt-12 text-xs text-gray-500 text-center border-t pt-4">
                <p>Garantia de 90 dias para serviços prestados, conforme Art. 26 do Código de Defesa do Consumidor.</p>
                <p>Equipamentos não retirados em até 90 dias poderão ser descartados ou vendidos para custear despesas.</p>
            </div>

            {/* Screen-only Print Button */}
            <div className="fixed bottom-8 right-8 print:hidden">
                <Button onClick={() => window.print()} className="shadow-lg">
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir Novamente
                </Button>
            </div>
        </div>
    );
}
