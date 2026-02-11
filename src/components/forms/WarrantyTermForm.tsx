"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const warrantyTermSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    content: z.string().min(1, "Conteúdo é obrigatório"),
});

type WarrantyTermFormData = z.infer<typeof warrantyTermSchema>;

interface WarrantyTermFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export function WarrantyTermForm({ isOpen, onClose, onSuccess, initialData }: WarrantyTermFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<WarrantyTermFormData>({
        resolver: zodResolver(warrantyTermSchema),
        defaultValues: initialData ? {
            name: initialData.name,
            content: initialData.content,
        } : {
            name: "",
            content: "",
        },
    });

    async function onSubmit(data: WarrantyTermFormData) {
        setIsLoading(true);
        try {
            const url = initialData ? `/api/warranty-terms/${initialData.id}` : "/api/warranty-terms";
            const method = initialData ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Erro ao salvar termo");

            toast.success(initialData ? "Termo atualizado!" : "Termo criado!");
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar termo de garantia.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Editar Termo" : "Novo Termo de Garantia"}</DialogTitle>
                    <DialogDescription>
                        Defina o nome e o texto completo que será exibido nos documentos.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Nome do Termo (ex: Garantia de Peças)</Label>
                        <Input {...form.register("name")} placeholder="Digite o nome amigável" />
                        {form.formState.errors.name && (
                            <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Conteúdo Legal / Texto</Label>
                        <Textarea
                            {...form.register("content")}
                            placeholder="Digite o texto completo da garantia..."
                            className="min-h-[200px]"
                        />
                        {form.formState.errors.content && (
                            <p className="text-xs text-red-500">{form.formState.errors.content.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {initialData ? "Salvar Alterações" : "Criar Termo"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
