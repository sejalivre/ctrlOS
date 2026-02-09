"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/forms/ProductForm";
import { Plus, Pencil } from "lucide-react";
import { useState } from "react";

interface ProductDialogProps {
    initialData?: any;
    onRefresh?: () => void;
    trigger?: React.ReactNode;
}

export function ProductDialog({ initialData, onRefresh, trigger }: ProductDialogProps) {
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
                                Novo Produto
                            </>
                        )}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? "Editar Produto" : "Cadastrar Novo Produto"}
                    </DialogTitle>
                </DialogHeader>
                <ProductForm initialData={initialData} onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
    );
}
