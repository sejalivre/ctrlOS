# 🔐 Configuração do Supabase Auth

Guia passo a passo para configurar a autenticação com Supabase no TechAssist Pro.

## 📋 Pré-requisitos

1. **Conta no Supabase** (gratuita): [supabase.com](https://supabase.com)
2. **Projeto criado** no Supabase
3. **Node.js** 18+ instalado
4. **Repositório** TechAssist Pro clonado

## 🚀 Passo a Passo

### 1. **Criar/Copiar Credenciais do Supabase**

No **Supabase Dashboard** do seu projeto:

1. Vá para **Settings** → **API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. **Configurar Variáveis de Ambiente**

No arquivo `.env.local` (crie se não existir):

```bash
# Banco de Dados (Prisma)
# DATABASE_URL: Use o Hostname do Pooler (porta 6543) com ?pgbouncer=true
DATABASE_URL="postgresql://postgres.[PROJECT-ID]:[PASSWORD]@[POOLER-HOST]:6543/postgres?pgbouncer=true"

# DIRECT_URL: Use o Hostname Direto (porta 5432)
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-anon-aqui"

# URL da aplicação
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
AUTH_SECRET="uma-string-aleatoria-32-chars"
NODE_ENV="development"
```

### 3. **Configurar Authentication no Supabase Dashboard**

#### 3.1 Habilitar Email Provider
1. **Authentication** → **Providers**
2. Em **Email**, clique no botão de toggle para habilitar
3. Opcional: Configure **Confirm email** se quiser confirmação por email

#### 3.2 Configurar URLs de Redirecionamento
1. **Authentication** → **URL Configuration**
2. Configure:
   - **Site URL**: `https://os.hpinfo.com.br`
   - **Redirect URLs**:
     ```
     https://os.hpinfo.com.br/auth/callback
     https://os.hpinfo.com.br/**
     ```

### 4. **Instalar Dependências**

```bash
npm install
```

### 5. **Testar Configuração**

```bash
# Executar script de teste
node test-auth.js
```

Se tudo estiver correto, você verá:
```
✅ Conexão com Supabase OK
✅ Autenticação configurada corretamente
✅ Email provider habilitado
```

### 6. **Executar a Aplicação**

```bash
npm run dev
```

Acesse: [http://localhost:3000/login](http://localhost:3000/login)

## 🔧 Solução de Problemas

### ❌ "Invalid API key"
**Problema**: Chave anônima inválida.
**Solução**: 
1. Verifique se copiou a chave correta (anon public, não service role)
2. No Supabase Dashboard: Settings → API → anon public

### ❌ "Email provider is disabled"
**Problema**: Autenticação por email não habilitada.
**Solução**:
1. Supabase Dashboard → Authentication → Providers
2. Habilitar "Email"

### ❌ "redirect_to must be one of the allowed redirect URLs"
**Problema**: URLs de redirecionamento não configuradas.
**Solução**:
1. Supabase Dashboard → Authentication → URL Configuration
2. Adicionar: `http://localhost:3000/auth/callback`

### ❌ Tela de login do Supabase aparece
**Problema**: O Supabase está redirecionando para sua interface padrão.
**Solução**:
1. Verifique se a página `/auth/callback` existe
2. Verifique URLs de redirecionamento no Supabase
3. Verifique se está usando `signInWithPassword` (não `signInWithOAuth`)

### ❌ Usuário não é redirecionado após login
**Problema**: Middleware não está funcionando.
**Solução**:
1. Verifique arquivo `src/middleware.ts`
2. Verifique se o usuário está sendo sincronizado (`syncUserWithDatabase`)
3. Verifique cookies (HTTP-only devem estar habilitados)

## 📱 Testar Fluxo Completo

### 1. **Cadastro**
1. Acesse `/login`
2. Clique em "Não tem uma conta? Cadastre-se"
3. Preencha email e senha (mínimo 6 caracteres)
4. Clique em "Cadastrar"
5. Você deve ser redirecionado para a página principal

### 2. **Login**
1. Acesse `/login`
2. Use email e senha cadastrados
3. Clique em "Entrar"
4. Você deve ser redirecionado para a página principal

### 3. **Logout**
1. Clique no avatar no canto superior direito
2. Clique em "Sair"
3. Você deve ser redirecionado para `/login`

### 4. **Proteção de Rotas**
1. Tente acessar `/` sem estar logado → deve redirecionar para `/login`
2. Tente acessar `/login` já logado → deve redirecionar para `/`

## 🔒 Configurações Avançadas

### Confirmação de Email (Opcional)
Para exigir confirmação de email:
1. Supabase Dashboard → Authentication → Providers → Email
2. Habilitar "Confirm email"
3. Configurar template de email

### Redefinição de Senha
Já funciona automaticamente. Usuários podem:
1. Ir para: `https://seu-projeto.supabase.co/auth/v1/recover`
2. Ou implementar página personalizada (recomendado)

### Políticas de Senha
Para aumentar segurança:
1. Supabase Dashboard → Authentication → Settings
2. Configurar:
   - Minimum password length: 8
   - Password required characters: letters and numbers

### Rate Limiting
Habilitado por padrão:
- 10 tentativas de login por minuto por IP
- 5 tentativas de cadastro por hora por IP

## 🚀 Produção

### 1. **Variáveis de Ambiente (Vercel)**
No painel da Vercel, configure as variáveis essenciais. **IMPORTANTE:** Para o Vercel, você DEVE usar o Connection Pooler.

| Variável | Valor / Formato |
| :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres.[ID]:[SENHA]@[POOLER-HOST]:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | `postgresql://postgres:[SENHA]@db.[ID].supabase.co:5432/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[ID].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sua anon key |
| `AUTH_SECRET` | Uma string aleatória segura |
| `NEXTAUTH_URL` | `https://seu-dominio.com` |

> [!TIP]
> O **POOLER-HOST** é encontrado no Supabase em Settings -> Database -> Connection Pooler. Geralmente termina em `.pooler.supabase.com`.

### 2. **URLs de Produção**
No Supabase Dashboard:
- **Site URL**: `https://os.hpinfo.com.br`
- **Redirect URLs**: `https://os.hpinfo.com.br/auth/callback`

### 3. **SSL/HTTPS**
- Automático na Vercel
- Verifique se `NEXT_PUBLIC_SITE_URL` usa `https://`

### 4. **Backup e Monitoramento**
1. Habilitar backups automáticos no Supabase
2. Configurar alerts para auth events
3. Monitorar logs de autenticação

## 📊 Verificação Final

✅ **Testes a passar:**
- [ ] Cadastro funciona
- [ ] Login funciona  
- [ ] Logout funciona
- [ ] Rotas protegidas
- [ ] Sessão persiste
- [ ] Build de produção OK
- [ ] Deploy na Vercel OK

✅ **Segurança:**
- [ ] Senhas hashadas (Supabase cuida disso)
- [ ] Cookies HTTP-only
- [ ] Tokens JWT com expiração
- [ ] Rate limiting habilitado

## 🆘 Suporte

**Problemas comuns:**
1. **Chaves expiradas**: Gere novas no Supabase Dashboard
2. **Usuários duplicados**: Limpe tabela `auth.users` no Supabase
3. **Cookies bloqueados**: Verifique configurações do navegador

**Links úteis:**
- [Documentação Supabase Auth](https://supabase.com/docs/guides/auth)
- [Exemplos Next.js + Supabase](https://github.com/supabase/supabase/tree/master/examples)
- [Fórum Supabase](https://github.com/supabase/supabase/discussions)

---

**Nota**: Este sistema substitui o Google OAuth anterior. Usuários existentes precisarão se cadastrar novamente.