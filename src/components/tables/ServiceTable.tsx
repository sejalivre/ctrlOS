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
import { ServiceDialog } from "@/components/modals/ServiceDialog";
import { Trash2, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Service {
    id: string;
    code: string;
    name: string;
    defaultPrice: number;
    duration: number | null;
    active: boolean;
}

interface ServiceTableProps {
    services: Service[];
    onRefresh: () => void;
}

export function ServiceTable({ services, onRefresh }: ServiceTableProps) {
    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir este serviço?")) return;

        try {
            const response = await fetch(`/api/services/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Erro ao excluir serviço");

            toast.success("Serviço excluído!");
            onRefresh();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao excluir serviço.");
        }
    }

    return (
        <div className="rounded-md border bg-white overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Cód.</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Preço Padrão</TableHead>
                        <TableHead>Duração (min)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {services.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                Nenhum serviço encontrado.
                            </TableCell>
                        </TableRow>
                    ) : (
                        services.map((service) => (
                            <TableRow key={service.id} className="hover:bg-slate-50 transition-colors">
                                <TableCell className="text-xs font-mono text-muted-foreground">
                                    {service.code.split('-')[0]}
                                </TableCell>
                                <TableCell className="font-medium">{service.name}</TableCell>
                                <TableCell>
                                    R$ {Number(service.defaultPrice).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell>
                                    {service.duration ? `${service.duration} min` : "-"}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={service.active ? "secondary" : "outline"}>
                                        {service.active ? "Ativo" : "Inativo"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <ServiceDialog
                                            initialData={service}
                                            onRefresh={onRefresh}
                                        />
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDelete(service.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
