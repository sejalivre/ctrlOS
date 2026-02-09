"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema, SettingsFormData } from "@/schemas/settings";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Save, Building2, Globe, Mail, Phone, MapPin, ReceiptText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsFormProps {
    initialData?: any;
}

export function SettingsForm({ initialData }: SettingsFormProps) {
    const form = useForm<SettingsFormData>({
        resolver: zodResolver(settingsSchema as any),
        defaultValues: initialData || {
            companyName: "Minha Assistência",
            companyLogo: "",
            companyPhone: "",
            companyEmail: "",
            companyAddress: "",
            companyDocument: "",
            currency: "BRL",
            footerText: "",
        },
    });

    async function onSubmit(data: SettingsFormData) {
        try {
            const response = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Erro ao salvar configurações");
            }

            toast.success("Configurações salvas com sucesso!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Erro ao salvar configurações.");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Company Info */}
                    <Card className="border-none shadow-md overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-indigo-600" />
                                <CardTitle className="text-lg">Informações da Empresa</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Nome da Empresa *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nome Fantasia" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="companyDocument"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>CNPJ / CPF</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <ReceiptText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input className="pl-10" placeholder="00.000.000/0001-00" {...field} value={field.value || ""} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="companyLogo"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>URL da Logomarca</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input className="pl-10" placeholder="https://exemplo.com/logo.png" {...field} value={field.value || ""} />
                                            </div>
                                        </FormControl>
                                        <FormDescription>Utilize uma URL de imagem pública.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Contact Info */}
                    <Card className="border-none shadow-md overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <div className="flex items-center gap-2">
                                <Phone className="h-5 w-5 text-indigo-600" />
                                <CardTitle className="text-lg">Contatos e Endereço</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <FormField
                                control={form.control}
                                name="companyPhone"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Telefone / WhatsApp</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input className="pl-10" placeholder="(11) 99999-9999" {...field} value={field.value || ""} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="companyEmail"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>E-mail de Contato</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input className="pl-10" placeholder="contato@empresa.com" {...field} value={field.value || ""} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="companyAddress"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Endereço Completo</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input className="pl-10" placeholder="Rua, Número, Bairro, Cidade - UF" {...field} value={field.value || ""} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-none shadow-md">
                    <CardHeader className="border-b">
                        <CardTitle className="text-lg font-bold">Preferências do Sistema</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Moeda Padrão</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="BRL" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="footerText"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Texto do Rodapé (Recibos/PDF)</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Obrigado pela preferência!" value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button
                        type="submit"
                        size="lg"
                        className="bg-indigo-600 hover:bg-indigo-700 font-bold px-8 shadow-lg"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                        ) : (
                            <><Save className="mr-2 h-4 w-4" /> Salvar Alterações</>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
