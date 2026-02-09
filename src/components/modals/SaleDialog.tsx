"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SaleForm } from "@/components/forms/SaleForm";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";

interface SaleDialogProps {
    onRefresh?: () => void;
}

export function SaleDialog({ onRefresh }: SaleDialogProps) {
    const [open, setOpen] = useState(false);

    const handleSuccess = () => {
        setOpen(false);
        onRefresh?.();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="bg-green-600 hover:bg-green-700 shadow-lg">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Nova Venda (PDV)
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-slate-800">PONTO DE VENDA</DialogTitle>
                </DialogHeader>
                <SaleForm onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
    );
}
