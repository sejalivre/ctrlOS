# 🗄️ Configuração do Banco de Dados na Vercel

Guia para resolver o erro de conexão com o banco de dados do Supabase na Vercel.

## 🚨 Erro Atual

```
Invalid `prisma.user.findUnique()` invocation:
Can't reach database server at `db.zjapynvxybowjjzktxyd.supabase.co:5432`
```

## 🔍 Causas do Problema

### 1. **Variável `DATABASE_URL` não configurada** na Vercel
### 2. **URL do banco incorreta** ou incompleta
### 3. **SSL não habilitado** (Supabase requer SSL)
### 4. **Firewall bloqueando conexão**
### 5. **Banco não existe** ou sem permissões

## 🚀 Solução Passo a Passo

### **Passo 1: Obter Credenciais do Supabase**

No **Supabase Dashboard** do seu projeto (`zjapynvxybowjjzktxyd`):

1. **Settings** → **Database**
2. **Connection string** → **URI**
3. Copie a string que começa com:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.zjapynvxybowjjzktxyd.supabase.co:5432/postgres
   ```

### **Passo 2: Configurar na Vercel**

No **Vercel Dashboard** do seu projeto:

1. **Settings** → **Environment Variables**
2. Adicione as variáveis:

```
DATABASE_URL=postgresql://postgres:[SENHA]@db.zjapynvxybowjjzktxyd.supabase.co:5432/postgres?sslmode=require
NEXT_PUBLIC_SUPABASE_URL=https://zjapynvxybowjjzktxyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
NEXT_PUBLIC_SITE_URL=https://os.hpinfo.com.br
```

**IMPORTANTE:** Adicione `?sslmode=require` no final da `DATABASE_URL`

### **Passo 3: Configurar Firewall do Supabase**

No **Supabase Dashboard**:
1. **Settings** → **Database**
2. **Connection Pooling**
3. **Allowed IP addresses**
4. Adicione: `0.0.0.0/0` (para permitir todas as conexões) **OU**
5. Adicione os IPs da Vercel (mais seguro)

### **Passo 4: Executar Migrações**

**Opção A: Via Script (recomendado)**
```bash
node setup-production-db.js
```

**Opção B: Manualmente**
```bash
# Gerar Prisma Client
npx prisma generate

# Aplicar migrações
npx prisma migrate deploy

# Se falhar, tente criar banco do zero
npx prisma db push --accept-data-loss
```

### **Passo 5: Verificar Conexão**

```bash
# Testar conexão
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$connect()
  .then(() => console.log('✅ Conexão OK'))
  .catch(e => console.log('❌ Erro:', e.message))
  .finally(() => prisma.$disconnect());
"
```

## 🔧 Soluções para Problemas Específicos

### **Problema 1: "Can't reach database server"**
```bash
# Verificar se o host está acessível
ping db.zjapynvxybowjjzktxyd.supabase.co

# Testar porta
telnet db.zjapynvxybowjjzktxyd.supabase.co 5432
```

**Solução:** Verificar firewall do Supabase e rede da Vercel.

### **Problema 2: "SSL connection required"**
```
Adicione ?sslmode=require ao final da DATABASE_URL
```

### **Problema 3: "Authentication failed"**
Verifique:
1. Senha correta
2. Usuário `postgres`
3. Banco `postgres`

### **Problema 4: "Database does not exist"**
No Supabase SQL Editor:
```sql
CREATE DATABASE postgres; -- Já existe por padrão
-- OU
CREATE DATABASE ctrlos_prod;
```

## 📊 Configuração Recomendada

### **Variáveis de Ambiente na Vercel:**
```env
# Banco de Dados
DATABASE_URL=postgresql://postgres:SENHA_AQUI@db.zjapynvxybowjjzktxyd.supabase.co:5432/postgres?sslmode=require

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://zjapynvxybowjjzktxyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_AQUI

# Aplicação
NEXT_PUBLIC_SITE_URL=https://os.hpinfo.com.br
NODE_ENV=production
```

### **Configuração do Supabase:**
1. **Database** → **Settings** → Habilitar SSL
2. **Database** → **Settings** → Configurar firewall
3. **Authentication** → **Providers** → Email habilitado
4. **Authentication** → **URL Configuration** → `https://os.hpinfo.com.br`

## 🧪 Testes Pós-Configuração

### **Teste 1: Conexão Básica**
```bash
# Executar script de teste
node setup-production-db.js
```

### **Teste 2: Aplicação**
1. Acesse: `https://os.hpinfo.com.br`
2. Cadastre um usuário
3. Verifique se aparece no Supabase Dashboard

### **Teste 3: Logs**
1. **Vercel Dashboard** → **Deployments** → **Logs**
2. Verifique se há erros de conexão

## 🚨 Troubleshooting Avançado

### **Se ainda falhar:**

#### **1. Usar Connection Pooling (recomendado)**
No Supabase Dashboard:
1. **Settings** → **Database** → **Connection Pooling**
2. Use a URL do pooler:
```
postgresql://postgres:[SENHA]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

#### **2. Verificar Limites do Supabase**
Plano gratuito tem limites:
- 500MB de armazenamento
- 2 conexões simultâneas
- Verifique se não excedeu

#### **3. Configurar Prisma para Produção**
No `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "prisma:deploy": "prisma migrate deploy"
  }
}
```

#### **4. Usar Variáveis Secretas**
Na Vercel, marque `DATABASE_URL` como **Secret** (não visível no frontend).

## 📞 Suporte

### **Logs para compartilhar:**
1. Logs da Vercel (erro completo)
2. Configuração do Supabase (sem senhas)
3. Saída do `setup-production-db.js`

### **Links Úteis:**
- [Supabase Connection Issues](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Prisma Deployment Guide](https://www.prisma.io/docs/orm/prisma-client/deployment)

---

**Nota:** O erro mais comum é **esquecer de adicionar `?sslmode=require`** na `DATABASE_URL`. O Supabase requer SSL para todas as conexões.