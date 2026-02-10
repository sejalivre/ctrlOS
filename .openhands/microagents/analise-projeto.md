---
name: analise-projeto
type: knowledge
version: 1.0.0
agent: CodeActAgent
triggers: []
---

# Análise do Projeto ctrlOS

Este microagente fornece orientações para análise completa do projeto ctrlOS (TechAssist Pro), um sistema de gestão para assistências técnicas.

## Visão Geral do Projeto

**ctrlOS** é uma aplicação SaaS desenvolvida em Next.js para gerenciamento de assistências técnicas e lojas de reparos. O sistema oferece funcionalidades completas para gestão de clientes, ordens de serviço, estoque, vendas e controle financeiro.

## Stack Tecnológica

- **Framework**: Next.js 16.1.6 com App Router
- **Frontend**: React 19.2.3, Tailwind CSS, Radix UI
- **Backend**: API Routes do Next.js
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: NextAuth.js
- **Validação**: Zod com React Hook Form
- **Linguagem**: TypeScript

## Estrutura do Projeto

```
ctrlOS/
├── src/
│   ├── app/                    # App Router (páginas e rotas)
│   │   ├── (auth)/            # Rotas de autenticação
│   │   ├── (dashboard)/       # Rotas do dashboard principal
│   │   │   ├── budgets/       # Gestão de orçamentos
│   │   │   ├── customers/     # Gestão de clientes
│   │   │   ├── financial/     # Controle financeiro
│   │   │   ├── os/            # Ordens de serviço
│   │   │   ├── products/      # Produtos e estoque
│   │   │   ├── reports/       # Relatórios
│   │   │   ├── sales/         # Vendas e PDV
│   │   │   ├── services/      # Catálogo de serviços
│   │   │   └── settings/      # Configurações
│   │   └── api/               # API Routes
│   ├── components/            # Componentes React
│   │   ├── forms/             # Formulários
│   │   ├── modals/            # Modais
│   │   ├── tables/            # Tabelas
│   │   └── ui/                # Componentes UI base
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilitários e configurações
│   └── schemas/               # Schemas Zod para validação
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── migrations/            # Migrações do banco
├── docs/                      # Documentação
│   └── features/              # Documentação das funcionalidades
└── public/                    # Arquivos estáticos
```

## Modelos de Dados Principais

### Usuários e Autenticação
- **User**: Usuários do sistema com roles (ADMIN, TECHNICIAN, RECEPTIONIST)
- **Account/Session**: Gerenciamento de sessões NextAuth

### Entidades de Negócio
- **Customer**: Clientes da assistência técnica
- **Product**: Produtos com controle de estoque
- **Service**: Catálogo de serviços oferecidos
- **Supplier**: Fornecedores de produtos

### Operações
- **ServiceOrder**: Ordens de serviço (OS) com status workflow
- **Equipment**: Equipamentos vinculados às OS
- **Budget**: Orçamentos para clientes
- **Sale**: Vendas realizadas

### Financeiro
- **FinancialRecord**: Registros de receitas e despesas
- **PaymentMethod**: Métodos de pagamento suportados

## Funcionalidades Implementadas

1. **Gestão de Clientes** - CRUD completo com busca e filtros
2. **Ordens de Serviço** - Workflow completo com status e prioridades
3. **Produtos & Estoque** - Controle de inventário com alertas
4. **Catálogo de Serviços** - Serviços com preços padrão
5. **Gestão de Orçamentos** - Criação e conversão para OS
6. **Vendas & PDV** - Ponto de venda integrado
7. **Controle Financeiro** - Receitas, despesas e fluxo de caixa
8. **Relatórios & BI** - Dashboards e análises
9. **Configurações** - Personalização do sistema

## Guia de Análise

### Para Analisar a Estrutura
1. Examine `/src/app` para entender as rotas e páginas
2. Revise `/prisma/schema.prisma` para o modelo de dados
3. Consulte `/docs/features` para documentação detalhada

### Para Analisar Componentes
1. Verifique `/src/components/ui` para componentes base
2. Analise `/src/components/forms` para formulários
3. Revise `/src/schemas` para validações

### Para Analisar APIs
1. Explore `/src/app/api` para endpoints
2. Verifique `/src/lib/prisma.ts` para conexão com banco
3. Analise `/src/lib/auth.ts` para autenticação

## Comandos Úteis

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev

# Visualizar banco de dados
npx prisma studio

# Build de produção
npm run build

# Lint do código
npm run lint
```

## Considerações de Análise

- O projeto usa o padrão App Router do Next.js 16
- Autenticação via NextAuth com adapter Prisma
- Validação de formulários com Zod + React Hook Form
- UI construída com Radix UI e Tailwind CSS
- Banco PostgreSQL com Prisma como ORM
- Documentação em português brasileiro
