// Verification: 2026-02-11 18:34:21
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Cadastro
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: email.split('@')[0],
            },
            // Não redirecionar automaticamente - deixe o usuário fazer login manualmente
            emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
          },
        });

        if (error) throw error;

        // Verificar se precisa de confirmação de email
        if (data.user?.identities?.length === 0) {
          // Email já cadastrado ou precisa de confirmação
          setError("Este email já está cadastrado. Faça login ou use outro email.");
        } else if (data.user && !data.session) {
          // Cadastro bem-sucedido mas sem sessão (precisa confirmar email)
          setError("Cadastro realizado! Verifique seu email para confirmar a conta antes de fazer login.");
          setIsSignUp(false); // Volta para tela de login
        } else if (data.session) {
          // Cadastro com sessão automática (confirmação desabilitada)
          router.push("/");
          router.refresh();
        }
      } else {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Tratar erros específicos
          if (error.message.includes('Invalid login credentials')) {
            throw new Error("Email ou senha incorretos");
          } else if (error.message.includes('Email not confirmed')) {
            throw new Error("Email não confirmado. Verifique sua caixa de entrada.");
          } else {
            throw error;
          }
        }

        if (data.user) {
          router.push("/");
          router.refresh();
        }
      }
    } catch (err: any) {
      setError(err.message || "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-4">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">ctrlOS</CardTitle>
        <CardDescription>
          Sistema de gestão para assistências técnicas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={loading}
          >
            {loading ? "Processando..." : isSignUp ? "Cadastrar" : "Entrar"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground"
              disabled={loading}
            >
              {isSignUp 
                ? "Já tem uma conta? Faça login" 
                : "Não tem uma conta? Cadastre-se"}
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground pt-4">
            {isSignUp 
              ? "Após cadastro, você será redirecionado para o sistema"
              : "Faça login para acessar o sistema"}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

