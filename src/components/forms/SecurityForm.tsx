"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function SecurityForm() {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleChangePassword() {
    if (password.length < 8) {
      toast.error("Senha deve ter pelo menos 8 caracteres");
      return;
    }
    if (password !== confirm) {
      toast.error("Confirmação de senha não confere");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Senha atualizada!");
      setCurrent("");
      setPassword("");
      setConfirm("");
    } catch (e: any) {
      toast.error(e.message || "Erro ao atualizar senha");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Senha atual</Label>
        <Input type="password" value={current} onChange={e => setCurrent(e.target.value)} placeholder="••••••••" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nova senha</Label>
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="mín. 8 caracteres" />
        </div>
        <div className="space-y-2">
          <Label>Confirmar nova senha</Label>
          <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="repita a senha" />
        </div>
      </div>
      <Button onClick={handleChangePassword} disabled={loading} className="bg-indigo-600 text-white">
        {loading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Atualizando...</>) : (<><ShieldCheck className="h-4 w-4 mr-2" />Atualizar Senha</>)}
      </Button>
      <div className="rounded-lg border p-4 bg-slate-50">
        <p className="text-sm text-slate-600">2FA (autenticação de dois fatores) ficará disponível em breve.</p>
      </div>
    </div>
  );
}
