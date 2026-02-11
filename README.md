# TechAssist Pro - Sistema de Gestão para Assistências Técnicas

Sistema completo de gestão de ordens de serviço, clientes, produtos e financeiro para assistências técnicas de informática.

## 🚀 Tecnologias

- **Framework:** Next.js 16 (App Router)
- **Linguagem:** TypeScript
- **Banco de Dados:** SQLite (dev) / PostgreSQL via Supabase (prod)
- **ORM:** Prisma 6
- **Autenticação:** Supabase Auth
- **UI:** Tailwind CSS + shadcn/ui
- **Formulários:** React Hook Form + Zod

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase (para autenticação e produção)

## ⚙️ Configuração Inicial

### 1. Clone o repositório

```bash
git clone https://github.com/sejalivre/ctrlOS.git
cd ctrlOS
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Copie o template de exemplo
cp .env.example .env.local
```

Edite `.env.local` e adicione suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zjapynvxybowjjzktxyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
DATABASE_URL="file:./dev.db"
```

**Onde encontrar as credenciais:**
- Acesse: https://supabase.com/dashboard/project/zjapynvxybowjjzktxyd/settings/api
- Copie a **Project URL** e a **anon/public key**

### 4. Configure o banco de dados

```bash
# Gera o Prisma Client
npx prisma generate

# Cria o banco de dados SQLite local
npx prisma db push

# (Opcional) Abra o Prisma Studio para visualizar os dados
npx prisma studio
```

### 5. Execute o servidor de desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📚 Documentação

A documentação completa está disponível na pasta `/docs`:

- [SAAS_DEVELOPMENT_SKILL_EXPANDED.md](docs/SAAS_DEVELOPMENT_SKILL_EXPANDED.md) - Guia completo de desenvolvimento
- [/docs/features](docs/features) - Documentação de funcionalidades
- [/docs/guides](docs/guides) - Guias de setup e deployment

## 🔧 Solução de Problemas

### Erro: "Missing Supabase environment variables"

**Causa:** Variáveis de ambiente não configuradas.

**Solução:** 
1. Verifique se o arquivo `.env.local` existe na raiz do projeto
2. Confirme que as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão preenchidas
3. Reinicie o servidor de desenvolvimento

### Erro: Prisma Client não encontrado

**Solução:**
```bash
npx prisma generate
```

### Banco de dados não sincronizado

**Solução:**
```bash
npx prisma db push
```

## 🚢 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente no painel da Vercel
3. Deploy automático a cada push

**Variáveis de ambiente necessárias na Vercel:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL` (PostgreSQL do Supabase para produção)

## 📄 Licença

Este projeto está sob a licença MIT.

## 🔗 Links

- **Repositório:** [github.com/sejalivre/ctrlOS](https://github.com/sejalivre/ctrlOS)
- **Supabase Dashboard:** [zjapynvxybowjjzktxyd](https://supabase.com/dashboard/project/zjapynvxybowjjzktxyd)
- **Deploy:** [os.hpinfo.com.br](https://os.hpinfo.com.br/)

