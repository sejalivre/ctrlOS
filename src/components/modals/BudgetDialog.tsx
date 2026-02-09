"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BudgetForm } from "@/components/forms/BudgetForm";
import { FilePlus, Pencil } from "lucide-react";
import { useState } from "react";

interface BudgetDialogProps {
    initialData?: any;
    onRefresh?: () => void;
    trigger?: React.ReactNode;
}

export function BudgetDialog({ initialData, onRefresh, trigger }: BudgetDialogProps) {
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
                                <FilePlus className="h-4 w-4 mr-2" />
                                Novo Orçamento
                            </>
                        )}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? "Editar Orçamento" : "Novo Orçamento"}
                    </DialogTitle>
                </DialogHeader>
                <BudgetForm initialData={initialData} onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
    );
}
