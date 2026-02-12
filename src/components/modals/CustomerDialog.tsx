"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomerForm } from "@/components/forms/CustomerForm";
import { Plus, Pencil } from "lucide-react";
import { useState } from "react";
import type { CustomerFormData } from "@/schemas/customer";

interface CustomerDialogProps {
    initialData?: CustomerFormData & { id: string };
    onRefresh?: () => void;
    trigger?: React.ReactNode;
    isOpen?: boolean;
    onClose?: () => void;
    onSuccess?: (customer: any) => void;
}

export function CustomerDialog({ initialData, onRefresh, trigger, isOpen: externalOpen, onClose, onSuccess }: CustomerDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    
    // Use external control if provided, otherwise use internal state
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = externalOpen !== undefined ? onClose! : setInternalOpen;

    const handleSuccess = (customer?: any) => {
        setOpen(false);
        onRefresh?.();
        onSuccess?.(customer);
    };

    // Se estiver usando controle externo, não renderizar o DialogTrigger
    if (externalOpen !== undefined) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>
                            {initialData ? "Editar Cliente" : "Cadastrar Novo Cliente"}
                        </DialogTitle>
                    </DialogHeader>
                    <CustomerForm initialData={initialData} onSuccess={() => handleSuccess()} />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" variant={initialData ? "ghost" : "default"}>
                        {initialData ? (
                            <Pencil className="h-4 w-4" />
                        ) : (
                            <>
                                <Plus className="h-4 w-4 mr-2" />
                                Novo Cliente
                            </>
                        )}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? "Editar Cliente" : "Cadastrar Novo Cliente"}
                    </DialogTitle>
                </DialogHeader>
                <CustomerForm initialData={initialData} onSuccess={() => handleSuccess()} />
            </DialogContent>
        </Dialog>
    );
}