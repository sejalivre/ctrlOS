// Verification: 2026-02-11 18:34:21
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase";

export default function LoginDebugPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);

  const supabase = createClient();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]}: ${message}`]);
  };

  useEffect(() => {
    // Verificar sessão atual
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      addLog(`Sessão atual: ${session ? 'Sim' : 'Não'} ${error ? `(Erro: ${error.message})` : ''}`);
      
      if (session?.user) {
        setUserInfo({
          email: session.user.email,
          id: session.user.id,
          confirmed: !!session.user.email_confirmed_at,
          createdAt: session.user.created_at,
        });
      }
    };
    
    checkSession();
  }, []);

  const handleSignUp = async () => {
    setLoading(true);
    addLog(`Iniciando cadastro para: ${email}`);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: email.split('@')[0] },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        addLog(`❌ Erro no cadastro: ${error.message}`);
        return;
      }

      addLog(`✅ Cadastro realizado! User ID: ${data.user?.id}`);
      addLog(`📧 Email confirmado? ${data.user?.email_confirmed_at ? 'Sim' : 'Não'}`);
      addLog(`🔐 Sessão criada? ${data.session ? 'Sim' : 'Não'}`);
      addLog(`👤 Identidades: ${data.user?.identities?.length || 0}`);

      if (data.user?.identities?.length === 0) {
        addLog("⚠️  Email já cadastrado ou precisa de confirmação");
      }

      if (data.user && !data.session) {
        addLog("ℹ️  Precisa confirmar email antes de fazer login");
      }

      if (data.session) {
        addLog("🎉 Login automático após cadastro!");
        setUserInfo({
          email: data.user?.email,
          id: data.user?.id,
          confirmed: !!data.user?.email_confirmed_at,
        });
      }

    } catch (err: any) {
      addLog(`💥 Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    addLog(`Tentando login: ${email}`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        addLog(`❌ Erro no login: ${error.message}`);
        
        if (error.message.includes('Invalid login credentials')) {
          addLog("🔑 Email ou senha incorretos");
        } else if (error.message.includes('Email not confirmed')) {
          addLog("📧 Email não confirmado");
        }
        
        return;
      }

      addLog(`✅ Login bem-sucedido!`);
      addLog(`👤 User: ${data.user?.email}`);
      addLog(`🔐 Session: ${data.session ? 'Criada' : 'Não criada'}`);
      
      setUserInfo({
        email: data.user?.email,
        id: data.user?.id,
        confirmed: !!data.user?.email_confirmed_at,
      });

      // Verificar cookies
      addLog(`🍪 Cookies: ${document.cookie ? 'Presentes' : 'Ausentes'}`);

    } catch (err: any) {
      addLog(`💥 Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      addLog(`❌ Erro no logout: ${error.message}`);
    } else {
      addLog(`✅ Logout realizado`);
      setUserInfo(null);
    }
  };

  const checkUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      addLog(`❌ Erro ao obter usuário: ${error.message}`);
    } else if (user) {
      addLog(`👤 Usuário atual: ${user.email} (${user.id})`);
    } else {
      addLog(`👤 Nenhum usuário autenticado`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🔍 Debug de Autenticação Supabase</CardTitle>
            <CardDescription>
              Página para diagnosticar problemas de login/cadastro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha (mínimo 6 caracteres)</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    minLength={6}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSignUp} disabled={loading || !email || password.length < 6}>
                    {loading ? "Processando..." : "Cadastrar"}
                  </Button>
                  <Button onClick={handleLogin} disabled={loading || !email || !password}>
                    {loading ? "Processando..." : "Login"}
                  </Button>
                  <Button onClick={handleLogout} variant="outline">
                    Logout
                  </Button>
                  <Button onClick={checkUser} variant="outline">
                    Verificar Usuário
                  </Button>
                </div>

                {userInfo && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <h3 className="font-semibold text-green-800 mb-2">👤 Usuário Autenticado</h3>
                    <p className="text-sm text-green-700">Email: {userInfo.email}</p>
                    <p className="text-sm text-green-700">ID: {userInfo.id}</p>
                    <p className="text-sm text-green-700">Confirmado: {userInfo.confirmed ? 'Sim' : 'Não'}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">📝 Logs</h3>
                  <Button onClick={clearLogs} variant="outline" size="sm">
                    Limpar
                  </Button>
                </div>
                
                <div className="h-96 overflow-y-auto bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm">
                  {logs.length === 0 ? (
                    <p className="text-gray-400">Nenhum log ainda...</p>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="mb-1">
                        {log.includes('❌') ? (
                          <span className="text-red-400">{log}</span>
                        ) : log.includes('✅') ? (
                          <span className="text-green-400">{log}</span>
                        ) : log.includes('⚠️') ? (
                          <span className="text-yellow-400">{log}</span>
                        ) : (
                          <span>{log}</span>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h3 className="font-semibold text-blue-800 mb-2">💡 Dicas para Debug</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>1. Verifique console do navegador (F12)</li>
                    <li>2. Verifique aba Network → requests para Supabase</li>
                    <li>3. Verifique cookies (Application → Cookies)</li>
                    <li>4. Teste em modo anônimo/incógnito</li>
                    <li>5. Verifique configuração no Supabase Dashboard</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
