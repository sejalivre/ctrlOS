"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, FileText } from "lucide-react";

interface WarrantyTerm {
    id: string;
    name: string;
    content: string;
    createdAt: string;
}

interface WarrantyTermTableProps {
    terms: WarrantyTerm[];
    onEdit: (term: WarrantyTerm) => void;
    onDelete: (id: string) => void;
}

export function WarrantyTermTable({ terms, onEdit, onDelete }: WarrantyTermTableProps) {
    return (
        <div className="rounded-md border bg-white overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Conteúdo (Prévio)</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {terms.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                Nenhum termo de garantia cadastrado.
                            </TableCell>
                        </TableRow>
                    ) : (
                        terms.map((term) => (
                            <TableRow key={term.id} className="hover:bg-slate-50 transition-colors">
                                <TableCell>
                                    <FileText className="h-4 w-4 text-slate-400" />
                                </TableCell>
                                <TableCell className="font-bold text-slate-700">
                                    {term.name}
                                </TableCell>
                                <TableCell className="max-w-md truncate text-slate-500 text-sm">
                                    {term.content}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600"
                                            onClick={() => onEdit(term)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                                            onClick={() => onDelete(term.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
