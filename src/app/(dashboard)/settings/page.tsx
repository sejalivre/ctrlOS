// Verification: 2026-02-11 18:34:21
"use client";

import { useState, useEffect } from "react";
import { SettingsForm } from "@/components/forms/SettingsForm";
import { Settings, Loader2, ShieldCheck, UserCog, Users, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserTable } from "@/components/tables/UserTable";
import { UserForm } from "@/components/forms/UserForm";
import { WarrantyTermTable } from "@/components/tables/WarrantyTermTable";
import { WarrantyTermForm } from "@/components/forms/WarrantyTermForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import { ProfileForm as SettingsProfile } from "@/components/forms/ProfileForm";
import { SecurityForm as SettingsSecurity } from "@/components/forms/SecurityForm";

export default function SettingsPage() {
    const [settings, setSettings] = useState<any>(null);

    // Users state
    const [users, setUsers] = useState<any[]>([]);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    // Warranty Terms state
    const [warrantyTerms, setWarrantyTerms] = useState<any[]>([]);
    const [isWarrantyModalOpen, setIsWarrantyModalOpen] = useState(false);
    const [editingWarranty, setEditingWarranty] = useState<any>(null);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const [settingsRes, usersRes, warrantyRes] = await Promise.all([
                fetch("/api/settings"),
                fetch("/api/users"),
                fetch("/api/warranty-terms")
            ]);

            const settingsData = await settingsRes.json();
            const usersData = await usersRes.json();
            const warrantyData = await warrantyRes.json();

            setSettings(settingsData.settings);
            setUsers(usersData.users || []);
            setWarrantyTerms(warrantyData.terms || []);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleAddUser = () => {
        setEditingUser(null);
        setIsUserModalOpen(true);
    };

    const handleEditUser = (user: any) => {
        setEditingUser(user);
        setIsUserModalOpen(true);
    };

    const handleDeleteUser = async (user: any) => {
        if (!confirm(`Tem certeza que deseja inativar ${user.name}?`)) return;

        try {
            await fetch(`/api/users/${user.id}`, { method: "DELETE" });
            toast.success("Usuário inativado!");
            fetchData();
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Erro ao inativar usuário.");
        }
    };

    const handleAddWarranty = () => {
        setEditingWarranty(null);
        setIsWarrantyModalOpen(true);
    };

    const handleEditWarranty = (term: any) => {
        setEditingWarranty(term);
        setIsWarrantyModalOpen(true);
    };

    const handleDeleteWarranty = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este termo de garantia?")) return;

        try {
            await fetch(`/api/warranty-terms/${id}`, { method: "DELETE" });
            toast.success("Termo excluído!");
            fetchData();
        } catch (error) {
            console.error("Error deleting warranty term:", error);
            toast.error("Erro ao excluir termo.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="text-lg font-medium text-slate-600 animate-pulse">Carregando configurações...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto">
            <header className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                    <Settings className="h-5 w-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">Configurações GLOBAIS</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Configurações do Sistema</h1>
                <p className="text-slate-500 max-w-2xl">
                    Gerencie a identidade visual da sua empresa, informações de contato e preferências globais do sistema.
                </p>
            </header>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="bg-white border shadow-sm p-1 gap-1 h-12">
                    <TabsTrigger value="general" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 h-10 px-6 font-bold">
                        <Settings className="h-4 w-4 mr-2" /> Geral
                    </TabsTrigger>
                    <TabsTrigger value="users" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 h-10 px-6 font-bold text-slate-600">
                        <Users className="h-4 w-4 mr-2" /> Colaboradores
                    </TabsTrigger>
                    <TabsTrigger value="warranty" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 h-10 px-6 font-bold text-slate-600">
                        <FileText className="h-4 w-4 mr-2" /> Garantias
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 h-10 px-6 font-bold text-slate-400">
                        <UserCog className="h-4 w-4 mr-2" /> Meu Perfil
                    </TabsTrigger>
                    <TabsTrigger value="security" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 h-10 px-6 font-bold text-slate-400">
                        <ShieldCheck className="h-4 w-4 mr-2" /> Segurança
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-8">
                    <SettingsForm initialData={settings} />
                </TabsContent>

                <TabsContent value="users" className="mt-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold">Gerenciar Colaboradores</h2>
                                <p className="text-sm text-slate-500">Cadastre técnicos e atendentes.</p>
                            </div>
                            <Button onClick={handleAddUser} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Plus className="mr-2 h-4 w-4" /> Novo Colaborador
                            </Button>
                        </div>

                        <UserTable
                            users={users}
                            onEdit={handleEditUser}
                            onDelete={handleDeleteUser}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="warranty" className="mt-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold">Termos de Garantia</h2>
                                <p className="text-sm text-slate-500">Gerencie textos padrão para OS e Vendas.</p>
                            </div>
                            <Button onClick={handleAddWarranty} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Plus className="mr-2 h-4 w-4" /> Novo Termo
                            </Button>
                        </div>

                        <WarrantyTermTable
                            terms={warrantyTerms}
                            onEdit={handleEditWarranty}
                            onDelete={handleDeleteWarranty}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="profile" className="mt-8">
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Perfil do Usuário</CardTitle>
                            <CardDescription>Gerencie suas informações pessoais e preferências de conta.</CardDescription>
                        </CardHeader>
                        <CardContent className="border-t">
                            {/* Profile form */}
                            <div className="max-w-xl">
                                <SettingsProfile />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="mt-8">
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Segurança da Conta</CardTitle>
                            <CardDescription>Configurações de senha e autenticação de dois fatores.</CardDescription>
                        </CardHeader>
                        <CardContent className="border-t">
                            <div className="max-w-xl">
                                <SettingsSecurity />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {isUserModalOpen && (
                <UserForm
                    isOpen={isUserModalOpen}
                    onClose={() => setIsUserModalOpen(false)}
                    onSuccess={fetchData}
                    user={editingUser}
                />
            )}

            {isWarrantyModalOpen && (
                <WarrantyTermForm
                    isOpen={isWarrantyModalOpen}
                    onClose={() => setIsWarrantyModalOpen(false)}
                    onSuccess={fetchData}
                    initialData={editingWarranty}
                />
            )}
        </div>
    );
}

