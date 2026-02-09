"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ServiceForm } from "@/components/forms/ServiceForm";
import { Plus, Pencil } from "lucide-react";
import { useState } from "react";

interface ServiceDialogProps {
    initialData?: any;
    onRefresh?: () => void;
    trigger?: React.ReactNode;
}

export function ServiceDialog({ initialData, onRefresh, trigger }: ServiceDialogProps) {
    const [open, setOpen] = useState(false);

    const handleSuccess = () => {
        setOpen(false);
        onRefresh?.();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" variant={initialData ? "outline" : "default"}>
                        {initialData ? (
                            <Pencil className="h-4 w-4" />
                        ) : (
                            <>
                                <Plus className="h-4 w-4 mr-2" />
                                Novo Serviço
                            </>
                        )}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? "Editar Serviço" : "Cadastrar Novo Serviço"}
                    </DialogTitle>
                </DialogHeader>
                <ServiceForm initialData={initialData} onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
    );
}
