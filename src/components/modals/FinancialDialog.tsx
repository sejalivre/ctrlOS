"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Wallet } from "lucide-react";
import { FinancialForm } from "@/components/forms/FinancialForm";

interface FinancialDialogProps {
    onRefresh: () => void;
    initialData?: any;
    trigger?: React.ReactNode;
}

export function FinancialDialog({ onRefresh, initialData, trigger }: FinancialDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Novo Lançamento
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Wallet className="h-5 w-5 text-indigo-600" />
                        </div>
                        <DialogTitle>{initialData ? "Editar Lançamento" : "Novo Lançamento Financeiro"}</DialogTitle>
                    </div>
                </DialogHeader>
                <FinancialForm
                    initialData={initialData}
                    onSuccess={() => {
                        setOpen(false);
                        onRefresh();
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
