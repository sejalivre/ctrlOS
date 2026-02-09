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
}

export function CustomerDialog({ initialData, onRefresh, trigger }: CustomerDialogProps) {
    const [open, setOpen] = useState(false);

    const handleSuccess = () => {
        setOpen(false);
        onRefresh?.();
    };

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
                <CustomerForm initialData={initialData} onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
    );
}
