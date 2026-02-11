"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal,
    Printer,
    DollarSign,
    Eye,
    Edit,
    FileText
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { ConfirmPaymentModal } from "@/components/modals/ConfirmPaymentModal";

interface OSActionsProps {
    order: any;
}

export function OSActions({ order }: OSActionsProps) {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const handlePrint = () => {
        // Open print page in new tab
        window.open(`/os/${order.id}/print`, '_blank');
    };

    const handleFinancial = () => {
        if (!order.totalAmount || order.totalAmount <= 0) {
            toast.error("Esta OS não possui valor total para gerar financeiro.");
            return;
        }
        setIsPaymentModalOpen(true);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white hover:text-white rounded-md">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuItem asChild>
                        <Link href={`/os/${order.id}`} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/os/${order.id}/edit`} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handlePrint} className="cursor-pointer">
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleFinancial} className="cursor-pointer">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Ver no Financeiro
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                order={order}
            />
        </>
    );
}
