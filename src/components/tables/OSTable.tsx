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
import { OSStatusBadge } from "@/components/ui/os-status-badge";
import { Eye, MapPin, Calendar, User, Edit } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface ServiceOrder {
    id: string;
    orderNumber: number;
    status: string;
    priority: string;
    createdAt: string;
    customer: {
        name: string;
    };
    equipments: {
        type: string;
        model?: string;
    }[];
}

interface OSTableProps {
    orders: ServiceOrder[];
}

export function OSTable({ orders }: OSTableProps) {
    return (
        <div className="rounded-md border bg-white overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Nº OS</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Equipamento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                Nenhuma ordem de serviço encontrada.
                            </TableCell>
                        </TableRow>
                    ) : (
                        orders.map((order) => (
                            <TableRow key={order.id} className="hover:bg-slate-50 transition-colors">
                                <TableCell className="font-bold">
                                    #{String(order.orderNumber).padStart(4, '0')}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <User className="h-3.5 w-3.5 text-slate-400" />
                                        <span className="font-medium text-slate-700">{order.customer.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        {order.equipments[0]?.type} {order.equipments[0]?.model && `- ${order.equipments[0].model}`}
                                        {order.equipments.length > 1 && (
                                            <span className="text-xs text-blue-500 ml-1">
                                                (+{order.equipments.length - 1})
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <OSStatusBadge status={order.status} />
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {format(new Date(order.createdAt), "dd/MM/yyyy")}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/os/${order.id}`}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                Ver Detalhes
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/os/${order.id}/edit`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
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
