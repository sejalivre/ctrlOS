"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const [loading, setLoading] = useState(true);
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "" },
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (data.user) {
          form.reset({ name: data.user.name ?? "", email: data.user.email ?? "" });
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, [form]);

  async function onSubmit(values: ProfileFormData) {
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao atualizar perfil");
      }
      toast.success("Perfil atualizado!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao atualizar perfil");
    }
  }

  if (loading) {
    return <div className="flex items-center gap-2 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Carregando perfil...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="seu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="bg-indigo-600 text-white"><Save className="h-4 w-4 mr-2" />Salvar</Button>
      </form>
    </Form>
  );
}