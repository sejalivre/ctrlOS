"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OSForm } from "@/components/forms/OSForm";
import { Plus } from "lucide-react";
import { useState } from "react";

interface OSDialogProps {
    onRefresh?: () => void;
    trigger?: React.ReactNode;
}

export function OSDialog({ onRefresh, trigger }: OSDialogProps) {
    const [open, setOpen] = useState(false);

    const handleSuccess = () => {
        setOpen(false);
        onRefresh?.();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nova OS
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Abrir Nova Ordem de Serviço</DialogTitle>
                </DialogHeader>
                <OSForm onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
    );
}
