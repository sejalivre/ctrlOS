"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import OSEditFormSimpleItems from "@/components/forms/OSEditForm-simple-items";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function OSEditPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrder = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/os/${params.id}`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setOrder(data.order);
        } catch (error: any) {
            toast.error(error.message || "Erro ao carregar OS");
            router.push("/os");
        } finally {
            setIsLoading(false);
        }
    }, [params.id, router]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const handleSuccess = () => {
        toast.success("OS atualizada com sucesso!");
        router.push(`/os/${params.id}`);
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex flex-col gap-6">
                {/* Cabeçalho */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/os/${params.id}`}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Link>
                        </Button>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-slate-900 rounded-lg">
                                <ClipboardList className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    Editar OS #{String(order.orderNumber).padStart(4, '0')}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Atualize os detalhes da ordem de serviço
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formulário */}
                <Card>
                    <CardContent className="pt-6">
                        <OSEditFormSimpleItems 
                            orderId={params.id as string}
                            initialData={order}
                            onSuccess={handleSuccess}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}