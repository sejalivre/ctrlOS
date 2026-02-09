"use client";

import { useState, useEffect } from "react";
import { SettingsForm } from "@/components/forms/SettingsForm";
import { Settings, Loader2, ShieldCheck, UserCog } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
    const [settings, setSettings] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const response = await fetch("/api/settings");
                const result = await response.json();
                setSettings(result.settings);
            } catch (error) {
                console.error("Error loading settings:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchSettings();
    }, []);

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

                <TabsContent value="profile" className="mt-8">
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Perfil do Usuário</CardTitle>
                            <CardDescription>Gerencie suas informações pessoais e preferências de conta.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64 flex items-center justify-center border-t border-dashed bg-slate-50/50">
                            <p className="text-slate-400 italic font-medium">Módulo de perfil em breve...</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="mt-8">
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Segurança da Conta</CardTitle>
                            <CardDescription>Configurações de senha e autenticação de dois fatores.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64 flex items-center justify-center border-t border-dashed bg-slate-50/50">
                            <p className="text-slate-400 italic font-medium">Módulo de segurança em breve...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
