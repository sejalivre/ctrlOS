"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ClipboardList,
    ArrowLeft,
    User,
    Monitor,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Wrench,
    DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OSStatusBadge } from "@/components/ui/os-status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";
import OSItemsSection from "@/components/forms/OSItemsSection";

export default function OSDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchOrder = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/os/${params.id}`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setOrder(data.order);
        } catch (error: any) {
            toast.error(error.message);
            router.push("/os");
        } finally {
            setIsLoading(false);
        }
    }, [params.id, router]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const handleStatusChange = async (newStatus: string) => {
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/os/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) throw new Error("Erro ao atualizar status");

            toast.success("Status atualizado!");
            fetchOrder();
        } catch (error) {
            toast.error("Não foi possível mudar o status.");
        } finally {
            setIsUpdating(false);
        }
    };

    const initialFinancials = useMemo(() => {
        if (!order) return null;
        return {
            freightAmount: order.freightAmount || 0,
            othersAmount: order.othersAmount || 0,
            discountAmount: order.discountAmount || 0,
        };
    }, [order?.freightAmount, order?.othersAmount, order?.discountAmount]);

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/os">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">OS #{String(order.orderNumber).padStart(4, '0')}</h1>
                    <OSStatusBadge status={order.status} className="px-3 py-1 text-sm" />
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground hidden md:inline">Alterar Status:</span>
                    <Select defaultValue={order.status} onValueChange={handleStatusChange} disabled={isUpdating}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Lateral: Info Cliente */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-500" />
                                Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-lg font-bold text-slate-900">{order.customer.name}</p>
                                <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                                {order.customer.email && <p className="text-sm text-muted-foreground">{order.customer.email}</p>}
                            </div>
                            <Button variant="outline" size="sm" className="w-full" asChild>
                                <Link href="/customers">Ver cadastro completo</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-500" />
                                Prazos e Prioridade
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Entrada:</span>
                                <span>{format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Previsão:</span>
                                <span className="font-medium text-blue-600">
                                    {order.promisedDate ? format(new Date(order.promisedDate), "dd/MM/yyyy") : "Não definida"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Prioridade:</span>
                                <span className={order.priority === 'URGENT' ? 'text-red-600 font-bold' : ''}>
                                    {order.priority}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Centro: Equipamentos e Detalhes */}
                <div className="md:col-span-2 space-y-6">
                    {order.equipments.map((eq: any, idx: number) => (
                        <Card key={eq.id}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Monitor className="h-5 w-5 text-slate-700" />
                                    {eq.type} {eq.brand} {eq.model}
                                </CardTitle>
                                <CardDescription>Série: {eq.serialNumber || "N/A"}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 bg-slate-50 rounded-lg border">
                                    <h4 className="text-sm font-bold flex items-center gap-2 mb-2">
                                        <AlertCircle className="h-4 w-4 text-amber-500" />
                                        Problema Relatado
                                    </h4>
                                    <p className="text-slate-700">{eq.reportedIssue}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold flex items-center gap-2">
                                            <Wrench className="h-4 w-4 text-blue-500" />
                                            Diagnóstico
                                        </h4>
                                        <p className="text-sm text-slate-600 min-h-[60px] p-2 border rounded bg-white italic">
                                            {eq.diagnosis || "Aguardando avaliação técnica..."}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            Solução
                                        </h4>
                                        <p className="text-sm text-slate-600 min-h-[60px] p-2 border rounded bg-white italic">
                                            {eq.solution || "---"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Itens da OS */}
                    <OSItemsSection
                        serviceOrderId={params.id as string}
                        initialData={initialFinancials || undefined}
                        onTotalChange={(total) => {
                            if (order && Math.abs((order.totalAmount || 0) - total) > 0.01) {
                                setOrder((prev: any) => ({ ...prev, totalAmount: total }));
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
