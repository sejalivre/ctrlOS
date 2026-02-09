# SaaS Development Skill - Versão Expandida
## Com Integração TechAssist Pro

Este documento combina os padrões de desenvolvimento SaaS com especificações completas do projeto TechAssist Pro.

---

## 📋 VISÃO GERAL DO PROJETO TECHASSIST PRO

**TechAssist Pro** é um SaaS de gestão completa para assistências técnicas de informática, focado em ordens de serviço (OS), controle financeiro e vendas. Desenvolvido para operação de 10-20 atendimentos diários com fluxo simplificado e eficiente.

### 🎯 Objetivos Principais
- Gestão centralizada de Ordens de Serviço (coração do sistema)
- Controle financeiro integrado (fluxo de caixa diário)
- Vendas de produtos e serviços
- Automação de comunicação (WhatsApp)
- Relatórios gerenciais simples mas eficazes

---

## 🏗️ ARQUITETURA E STACK TECNOLÓGICA

### Core Stack
- **Framework:** Next.js 14+ (App Router, Server Components)
- **Linguagem:** TypeScript (strict mode)
- **Banco de Dados:** PostgreSQL via Supabase
- **ORM:** Prisma 6+ (com Prisma Studio para administração)
- **Autenticação:** NextAuth.js v5 (Auth.js) com Google Provider
- **UI/UX:** Tailwind CSS + shadcn/ui + Lucide React
- **Formulários:** React Hook Form + Zod (validação)
- **PDF:** @react-pdf/renderer (impressão de OS)
- **QR Code:** qrcode.react (etiquetas de equipamentos)
- **Notificações:** Sonner (toast) + Supabase Realtime

### Stack de Infraestrutura (Custo Zero)
- **Hospedagem:** Vercel (Hobby Plan - 100GB bandwidth/mês)
- **Banco:** Supabase Free Tier (500MB, 2M Edge Function invocations)
- **Storage:** Supabase Storage (fotos de equipamentos, 1GB free)
- **Repositório:** GitHub (privado ou público)
- **DNS/SSL:** Cloudflare (gratuito)

## 🔧 SOLUÇÃO DE PROBLEMAS (TROUBLESHOOTING)

### Erro: PrismaClientConstructorValidationError
**Sintoma:** `Using engine type "client" requires either "adapter" or "accelerateUrl" to be provided to PrismaClient constructor.`
**Causa:** O Prisma Client pode detectar incorretamente o ambiente e tentar usar o driver "client" (Node-API desativado/WASM) sem um adaptador configurado.
**Solução:** Forçar o uso da engine "library" no `schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
  engineType = "library"
}
```

### Estrutura de Pastas TechAssist Pro
```
techassist-pro/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Rotas públicas (login)
│   │   ├── (dashboard)/       # Rotas protegidas (painel)
│   │   │   ├── os/           # Ordens de Serviço
│   │   │   ├── customers/    # Clientes
│   │   │   ├── products/     # Produtos
│   │   │   ├── services/     # Serviços
│   │   │   ├── financial/    # Financeiro
│   │   │   ├── budgets/      # Orçamentos
│   │   │   ├── sales/        # Vendas
│   │   │   ├── reports/      # Relatórios
│   │   │   └── settings/     # Configurações
│   │   ├── api/              # API Routes (auth, webhooks)
│   │   └── layout.tsx        # Root layout
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── forms/            # Formulários específicos
│   │   │   ├── ServiceOrderForm/
│   │   │   ├── CustomerForm/
│   │   │   ├── ProductForm/
│   │   │   └── PaymentForm/
│   │   ├── tables/           # Tabelas de dados
│   │   │   ├── ServiceOrderTable/
│   │   │   ├── CustomerTable/
│   │   │   └── ProductTable/
│   │   ├── modals/           # Dialogs e popups
│   │   ├── pdf/              # Templates PDF
│   │   └── whatsapp/         # Integração WhatsApp
│   ├── lib/
│   │   ├── prisma.ts         # Cliente Prisma singleton
│   │   ├── auth.ts           # Configuração NextAuth
│   │   ├── storage.ts        # Supabase Storage helper
│   │   └── utils.ts          # Funções utilitárias
│   ├── hooks/                # Custom React hooks
│   │   ├── useServiceOrders.ts
│   │   ├── useCustomers.ts
│   │   ├── useProducts.ts
│   │   └── useFinancial.ts
│   ├── types/                # Tipagens TypeScript globais
│   ├── schemas/              # Schemas Zod (validação)
│   │   ├── serviceOrder.ts
│   │   ├── customer.ts
│   │   ├── product.ts
│   │   └── payment.ts
│   └── styles/               # CSS global e temas
├── prisma/
│   ├── schema.prisma         # Schema do banco de dados
│   ├── migrations/           # Migrações geradas
│   └── seed.ts              # Dados iniciais
├── public/
│   ├── templates/            # Templates PDF (logos, layouts)
│   └── assets/               # Imagens estáticas
├── docs/                     # Documentação do projeto
│   ├── features/            # Documentação de funcionalidades
│   │   ├── service-orders.md
│   │   ├── financial-control.md
│   │   ├── customer-management.md
│   │   └── whatsapp-integration.md
│   ├── adr/                 # Architecture Decision Records
│   ├── guides/              # Guias diversos
│   ├── api/                 # Documentação de API
│   └── diagrams/            # Diagramas do sistema
└── tests/                   # Testes automatizados
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## 🗄️ MODELO DE DADOS COMPLETO (PRISMA SCHEMA)

### Schema Prisma - TechAssist Pro

```prisma
// User (técnicos e administradores)
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  role          Role      @default(TECHNICIAN) // ADMIN, TECHNICIAN, RECEPTIONIST
  active        Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relações
  serviceOrders ServiceOrder[] // OS atribuídas
  sales         Sale[]         // Vendas realizadas
}

enum Role {
  ADMIN
  TECHNICIAN
  RECEPTIONIST
}

// Cliente
model Customer {
  id          String   @id @default(cuid())
  name        String
  phone       String   // Telefone principal
  whatsapp    String?  // WhatsApp (pode ser igual ao phone)
  email       String?
  document    String?  // CPF/CNPJ
  address     String?
  city        String?
  state       String?
  zipCode     String?
  notes       String?  // Observações gerais
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relações
  serviceOrders ServiceOrder[]
  budgets       Budget[]
  sales         Sale[]
  
  @@index([phone])
  @@index([name])
}

// Produto (estoque)
model Product {
  id          String   @id @default(cuid())
  code        String   @unique @default(uuid()) // Código automático
  name        String
  description String?
  supplierId  String?
  costPrice   Decimal  @db.Decimal(10, 2)  // Preço de compra
  salePrice   Decimal  @db.Decimal(10, 2)  // Preço de venda
  profitMargin Decimal? @db.Decimal(5, 2)  // % de lucro (calculado)
  stockQty    Int      @default(0)         // Quantidade em estoque
  minStock    Int      @default(5)         // Estoque mínimo (alerta)
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relações
  supplier    Supplier? @relation(fields: [supplierId], references: [id])
  orderItems  ServiceOrderItem[]
  saleItems   SaleItem[]
  
  @@index([name])
  @@index([stockQty])
}

// Serviço (mão de obra)
model Service {
  id          String   @id @default(cuid())
  code        String   @unique @default(uuid())
  name        String   // Ex: "Formatação", "Troca de Tela"
  description String?
  defaultPrice Decimal @db.Decimal(10, 2)
  duration    Int?     // Tempo estimado em minutos
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relações
  orderItems  ServiceOrderItem[]
  saleItems   SaleItem[]
}

// Fornecedor
model Supplier {
  id      String    @id @default(cuid())
  name    String
  phone   String?
  email   String?
  document String?
  products Product[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Ordem de Serviço (Entidade Central)
model ServiceOrder {
  id              String     @id @default(cuid())
  orderNumber     String     @unique @default(dbgenerated("nextval('os_sequence')")) // Número sequencial
  customerId      String
  technicianId    String?
  status          OSStatus   @default(OPENED)
  priority        Priority   @default(NORMAL)
  
  // Datas importantes
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  promisedDate    DateTime?  // Data prometida ao cliente
  completedAt     DateTime?  // Data de conclusão
  deliveredAt     DateTime?  // Data de entrega
  
  // Pagamento (integrado na OS)
  totalAmount     Decimal    @db.Decimal(10, 2) @default(0)
  paymentMethod   PaymentMethod?
  paid            Boolean    @default(false)
  paidAt          DateTime?
  
  // Campos técnicos
  entryQueue      Int?       // Número na fila de entrada (triagem)
  entryPhotos     String[]   // URLs das fotos no Supabase Storage
  exitPhotos      String[]   // Fotos na saída (evidência)
  customerSignature String?  // Base64 da assinatura digital
  
  // Relações
  customer        Customer   @relation(fields: [customerId], references: [id])
  technician      User?      @relation(fields: [technicianId], references: [id])
  equipments      Equipment[]
  items           ServiceOrderItem[]
  financialRecords FinancialRecord[]
  
  @@index([customerId])
  @@index([status])
  @@index([createdAt])
  @@index([technicianId])
}

enum OSStatus {
  OPENED           // Recém aberta, aguardando triagem
  IN_QUEUE         // Na fila, aguardando técnico
  IN_PROGRESS      // Técnico trabalhando
  AWAITING_PARTS   // Aguardando peças/aprovação
  READY            // Pronta para retirada
  DELIVERED        // Entregue ao cliente
  CANCELLED        // Cancelada
  WARRANTY_RETURN  // Retorno em garantia
}

enum Priority {
  LOW
  NORMAL
  HIGH
  URGENT
}

enum PaymentMethod {
  CASH
  DEBIT_CARD
  CREDIT_CARD
  PIX
  BANK_TRANSFER
  PROMISSORY_NOTE  // Fiado
}

// Equipamentos (1 OS pode ter N equipamentos)
model Equipment {
  id              String   @id @default(cuid())
  serviceOrderId  String
  type            String   // Ex: Notebook, Desktop, Celular
  brand           String?
  model           String?
  serialNumber    String?
  reportedIssue   String   // Problema relatado pelo cliente
  diagnosis       String?  // Diagnóstico técnico
  solution        String?  // Solução aplicada
  
  // Garantia
  warrantyDays    Int?     @default(30)
  warrantyExpires DateTime?
  
  // Acessórios
  accessories     String?  // Ex: "Carregador, Mouse"
  observations    String?  // Observações gerais
  
  // Relação
  serviceOrder    ServiceOrder @relation(fields: [serviceOrderId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([serviceOrderId])
}

// Itens da OS (produtos e serviços)
model ServiceOrderItem {
  id              String   @id @default(cuid())
  serviceOrderId  String
  
  // Pode ser produto OU serviço
  productId       String?
  serviceId       String?
  
  description     String   // Nome do item no momento da venda
  quantity        Int      @default(1)
  unitPrice       Decimal  @db.Decimal(10, 2)
  totalPrice      Decimal  @db.Decimal(10, 2)
  
  // Relações
  serviceOrder    ServiceOrder @relation(fields: [serviceOrderId], references: [id], onDelete: Cascade)
  product         Product?     @relation(fields: [productId], references: [id])
  service         Service?     @relation(fields: [serviceId], references: [id])
  
  createdAt       DateTime @default(now())
  
  @@index([serviceOrderId])
}

// Orçamentos
model Budget {
  id              String   @id @default(cuid())
  budgetNumber    String   @unique
  customerId      String
  status          BudgetStatus @default(PENDING)
  validUntil      DateTime
  totalAmount     Decimal  @db.Decimal(10, 2)
  notes           String?
  
  // Se aprovado, pode virar OS
  convertedToOSId String?  @unique
  
  customer        Customer @relation(fields: [customerId], references: [id])
  items           BudgetItem[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([customerId])
  @@index([status])
}

enum BudgetStatus {
  PENDING
  APPROVED
  REJECTED
  EXPIRED
}

model BudgetItem {
  id          String   @id @default(cuid())
  budgetId    String
  productId   String?
  serviceId   String?
  description String
  quantity    Int
  unitPrice   Decimal  @db.Decimal(10, 2)
  totalPrice  Decimal  @db.Decimal(10, 2)
  
  budget      Budget   @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  product     Product? @relation(fields: [productId], references: [id])
  service     Service? @relation(fields: [serviceId], references: [id])
  
  @@index([budgetId])
}

// Vendas Diretas (sem OS)
model Sale {
  id            String   @id @default(cuid())
  saleNumber    String   @unique
  customerId    String?  // Opcional (venda balcão)
  sellerId      String   // Usuário que fez a venda
  totalAmount   Decimal  @db.Decimal(10, 2)
  paymentMethod PaymentMethod
  paid          Boolean  @default(true)
  
  customer      Customer? @relation(fields: [customerId], references: [id])
  seller        User      @relation(fields: [sellerId], references: [id])
  items         SaleItem[]
  financialRecords FinancialRecord[]
  
  createdAt     DateTime @default(now())
  
  @@index([customerId])
  @@index([sellerId])
  @@index([createdAt])
}

model SaleItem {
  id          String   @id @default(cuid())
  saleId      String
  productId   String?
  serviceId   String?
  description String
  quantity    Int
  unitPrice   Decimal  @db.Decimal(10, 2)
  totalPrice  Decimal  @db.Decimal(10, 2)
  
  sale        Sale     @relation(fields: [saleId], references: [id], onDelete: Cascade)
  product     Product? @relation(fields: [productId], references: [id])
  service     Service? @relation(fields: [serviceId], references: [id])
  
  @@index([saleId])
}

// Registros Financeiros (receitas e despesas)
model FinancialRecord {
  id              String   @id @default(cuid())
  type            FinancialType
  category        String   // Ex: Venda, Aluguel, Fornecedor
  description     String
  amount          Decimal  @db.Decimal(10, 2)
  paymentMethod   PaymentMethod?
  paid            Boolean  @default(false)
  
  // Referências opcionais
  serviceOrderId  String?
  saleId          String?
  
  serviceOrder    ServiceOrder? @relation(fields: [serviceOrderId], references: [id])
  sale            Sale?         @relation(fields: [saleId], references: [id])
  
  dueDate         DateTime?
  paidAt          DateTime?
  createdAt       DateTime @default(now())
  
  @@index([type])
  @@index([createdAt])
  @@index([paid])
}

enum FinancialType {
  INCOME    // Receita
  EXPENSE   // Despesa
}

// Logs de Atividades (auditoria)
model ActivityLog {
  id          String   @id @default(cuid())
  userId      String
  action      String   // Ex: "created_os", "updated_status"
  entityType  String   // Ex: "ServiceOrder", "Customer"
  entityId    String
  changes     Json?    // Mudanças realizadas
  createdAt   DateTime @default(now())
  
  @@index([userId])
  @@index([entityType, entityId])
  @@index([createdAt])
}
```

---

## 📐 REGRAS DE NEGÓCIO TECHASSIST PRO

### Ordens de Serviço (OS)

1. **Numeração:** Sequencial automática (001, 002, 003...) gerada pelo banco
2. **Status Workflow:** 
   - OPENED → IN_QUEUE, CANCELLED
   - IN_QUEUE → IN_PROGRESS, CANCELLED
   - IN_PROGRESS → AWAITING_PARTS, READY, CANCELLED
   - AWAITING_PARTS → IN_PROGRESS, CANCELLED
   - READY → DELIVERED, CANCELLED (raro, mas possível)
   - DELIVERED → WARRANTY_RETURN (apenas se dentro da garantia)
3. **Pagamento:** 
   - Se status = DELIVERED, obrigatório marcar como pago OU pendente (fiado)
   - Se pendente, criar registro em FinancialRecord com type=INCOME e paid=false
4. **Estoque:** Ao adicionar produto na OS, verificar se stockQty > 0. Se sim, decrementar. Se não, alertar "Estoque insuficiente"
5. **Garantia:** Ao finalizar (READY), calcular warrantyDays a partir do equipamento. Registrar no log.

### Financeiro

1. **Conciliação automática:** Quando OS marcada como paga, criar FinancialRecord type=INCOME
2. **Despesas:** Cadastro manual em tela separada (fornecedores, aluguel, etc)
3. **Fechamento diário:** Relatório simples: Total entradas (por método), Total saídas, Saldo

### Permissões (RBAC)

- **ADMIN:** Acesso total, configurações, relatórios financeiros completos
- **TECHNICIAN:** Criar/editar OS atribuídas a si, ver próprio dashboard, não vê custos dos produtos (apenas valores de venda)
- **RECEPTIONIST:** Criar OS, cadastrar clientes, receber pagamentos, não editar técnicos

---

## 📱 INTEGRAÇÕES E APIs

### Supabase (Banco e Storage)

- **Row Level Security (RLS):** Políticas por user_id para isolamento multi-tenant (futuro)
- **Storage:** Bucket "os-photos" com política de acesso por auth
- **Realtime:** Subscribe em mudanças de status das OS para atualização em tempo real

### WhatsApp (Evolução)

**Fase 1 (MVP):** 
- Botão "Copiar mensagem" com texto pré-formatado
- Link direto para `https://wa.me/55{telefone}?text={mensagem}`

**Fase 2 (Automação):**
- Integração com Evolution API ou WhatsApp Business API
- Templates: "OS Pronta", "Aguardando Aprovação", "Garantia"

### Impressão

- **OS Térmica:** Layout 80mm (impressora não fiscal)
- **OS A4:** Layout completo com termos e condições
- **Etiqueta:** 40x40mm com QR Code

---

## 🧪 CRITÉRIOS DE QUALIDADE E TESTES

### Testes Automatizados (Vitest + React Testing Library)

- **Unitários:** Cálculos financeiros, validações de CPF/CNPJ, formatação de moeda
- **Integração:** Fluxo de criação de OS, cálculo de estoque
- **E2E (Playwright):** Login, criar OS completa, fluxo de pagamento

### Padrões de Código

- **ESLint:** Configuração strict do Next.js
- **Prettier:** Tab 2 espaços, single quote, trailing comma
- **Conventional Commits:** `feat:`, `fix:`, `refactor:`, `docs:`

### Performance

- **Lighthouse:** Target 90+ em todas as métricas
- **Bundle:** Lazy load em modais e páginas de relatórios
- **Imagens:** Next.js Image component com otimização automática

---

## 📅 CRONOGRAMA DE DESENVOLVIMENTO (8 SEMANAS)

### Semana 1: Setup e Fundação
- [ ] Criar repositório GitHub (privado ou público)
- [ ] Configurar projeto Next.js 14 com TypeScript
- [ ] Configurar Tailwind + shadcn/ui (instalar componentes base: button, input, dialog, table, select)
- [ ] Configurar Prisma + Supabase (criar projeto, obter credenciais)
- [ ] Definir schema.prisma completo (todas as entidades)
- [ ] Rodar primeira migração (`prisma migrate dev`)
- [ ] Configurar NextAuth.js com Google Provider
- [ ] Criar layout base (sidebar navegação, header)
- [ ] Deploy inicial na Vercel (verificar build OK)
- [ ] **Documentar setup em `/docs/guides/setup.md`**

**Entregável:** Ambiente acessível online com login funcionando

### Semana 2: Cadastros Básicos (CRUDs)
- [ ] Tela de Clientes (listagem com busca, cadastro modal, edição)
- [ ] Busca inteligente (3 caracteres) com debounce
- [ ] Tela de Produtos (com cálculo automático de margem)
- [ ] Tela de Serviços (simples, rápida)
- [ ] Tela de Fornecedores (básico)
- [ ] Tela de Usuários/Técnicos (apenas ADMIN)
- [ ] Implementar permissões nas rotas (middleware)
- [ ] **Documentar cada CRUD em `/docs/features/`**

**Entregável:** Todos cadastros funcionando, busca inteligente ativa

### Semana 3: Ordens de Serviço - Core
- [ ] Tela de Listagem de OS (split view: lista | detalhes)
- [ ] Criação de OS (modal wizard: cliente → equipamento → problemas)
- [ ] Suporte a múltiplos equipamentos por OS
- [ ] Sistema de status com cores e workflow
- [ ] Adicionar produtos/serviços na OS (tabela dinâmica)
- [ ] Cálculo automático de totais
- [ ] Upload de fotos (Supabase Storage)
- [ ] Geração de número sequencial da OS
- [ ] **Documentar OS completa em `/docs/features/service-orders.md`**

**Entregável:** Criar OS completa, adicionar itens, mudar status

### Semana 4: Financeiro e Pagamentos
- [ ] Seção financeira na tela de OS (pagamento integrado)
- [ ] Tela de Caixa/Financeiro (entradas e saídas do dia)
- [ ] Controle de pagamentos pendentes (fiado)
- [ ] Marcar OS como paga (atualiza financeiro)
- [ ] Relatório simples de fechamento diário
- [ ] Dashboard com resumo financeiro
- [ ] **Documentar financeiro em `/docs/features/financial-control.md`**

**Entregável:** Fluxo de caixa funcionando, OS com pagamento

### Semana 5: Orçamentos, Vendas e Documentos
- [ ] Tela de Orçamentos (similar a OS, com validade)
- [ ] Converter Orçamento em OS (mantendo dados)
- [ ] Tela de Venda Direta (PDV rápido)
- [ ] Geração de PDF da OS (react-pdf)
- [ ] Layout de impressão térmica e A4
- [ ] Geração de etiqueta com QR Code
- [ ] **Documentar PDFs e orçamentos**

**Entregável:** Imprimir OS, criar orçamento, venda direta

### Semana 6: UX Avançada e Integrações
- [ ] Busca global (Ctrl+K) com comando palette
- [ ] Integração WhatsApp (link wa.me)
- [ ] Notificações toast (Sonner) para ações importantes
- [ ] Atalhos de teclado (Nova OS: Ctrl+N, Buscar: Ctrl+F)
- [ ] Responsividade mobile (prioridade em telas de tablet para técnicos)
- [ ] Tela do Técnico (simplificada, só suas OS)
- [ ] **Documentar WhatsApp em `/docs/features/whatsapp-integration.md`**

**Entregável:** Sistema fluido, atalhos, mobile-friendly

### Semana 7: Relatórios e Configurações
- [ ] Relatório de OS (filtros por período, técnico, status)
- [ ] Relatório de Produtos/Serviços (mais vendidos)
- [ ] Relatório de Clientes (frequência, inadimplentes)
- [ ] Relatório Financeiro detalhado (DRE simplificado)
- [ ] Configurações do sistema (status customizados, dados da empresa)
- [ ] Backup manual (exportar dados)
- [ ] **Documentar relatórios**

**Entregável:** Todos relatórios funcionando, configurações ajustáveis

### Semana 8: Testes, Polimento e Lançamento
- [ ] Testes E2E críticos (fluxo completo de OS)
- [ ] Revisão de performance (Lighthouse)
- [ ] Tratamento de erros (Error Boundaries)
- [ ] Loading states e skeletons
- [ ] Documentação básica (README com instruções de instalação)
- [ ] Configuração de domínio customizado (Cloudflare)
- [ ] Testes finais com dados reais (importar clientes antigos se possível)
- [ ] **Finalizar toda documentação em `/docs/`**

**Entregável:** Sistema em produção, pronto para uso diário

---

## 📚 DOCUMENTAÇÃO OBRIGATÓRIA - TECHASSIST PRO

### Estrutura da Pasta /docs

```
/docs
├── README.md                      # Índice geral do TechAssist Pro
├── ARCHITECTURE.md                # Arquitetura do sistema
├── /features                      # Documentação de funcionalidades
│   ├── README.md                  # Índice de features
│   ├── service-orders.md         # OS completa
│   ├── customer-management.md    # Gestão de clientes
│   ├── product-inventory.md      # Produtos e estoque
│   ├── financial-control.md      # Controle financeiro
│   ├── whatsapp-integration.md   # Integração WhatsApp
│   ├── pdf-generation.md         # Geração de PDFs
│   ├── budget-management.md      # Gestão de orçamentos
│   └── reports.md                # Relatórios gerenciais
├── /adr                          # Architecture Decision Records
│   ├── 001-next-js-app-router.md
│   ├── 002-supabase-backend.md
│   └── 003-prisma-orm.md
├── /guides                       # Guias diversos
│   ├── setup.md                  # Setup do projeto
│   ├── deployment.md             # Deploy Vercel
│   ├── database-migrations.md    # Migrations
│   └── permissions.md            # Sistema de permissões
├── /api                          # Documentação de API
│   └── endpoints.md              # Todos os endpoints
├── /diagrams                     # Diagramas do sistema
│   ├── os-workflow.png
│   ├── database-schema.png
│   └── architecture.png
└── /templates                    # Templates reutilizáveis
    └── FEATURE_TEMPLATE.md
```

### Documentação de Features - Exemplo ServiceOrder

Cada feature deve seguir o template e incluir:

```markdown
# Ordens de Serviço (Service Orders)

## Metadata
- **Status:** ✅ Completo
- **Versão:** 1.0.0
- **Data de criação:** 2024-02-09
- **Última atualização:** 2024-02-09
- **Responsável:** @dev-team

## Visão Geral

Sistema centralizado de gestão de ordens de serviço para assistências técnicas de informática.

### Problema que Resolve
- Controle manual de OS em papel/planilhas
- Falta de rastreamento de status
- Dificuldade em gerenciar múltiplos equipamentos
- Ausência de histórico e garantia

### User Stories

**Como recepcionista:**
- Quero criar uma OS rapidamente para não fazer fila de clientes
- Quero buscar clientes anteriores pelo telefone
- Quero adicionar fotos do equipamento na entrada

**Como técnico:**
- Quero ver apenas minhas OS pendentes
- Quero atualizar o diagnóstico e solução
- Quero marcar quando está pronta

**Como administrador:**
- Quero ver todas as OS do dia
- Quero saber quais estão atrasadas
- Quero relatórios de performance por técnico

## Arquitetura

### Diagrama de Fluxo
[Incluir diagrama Mermaid ou imagem]

### Estrutura de Arquivos
```
src/
├── app/
│   └── (dashboard)/
│       └── os/
│           ├── page.tsx           # Lista de OS
│           ├── [id]/
│           │   └── page.tsx      # Detalhes da OS
│           └── new/
│               └── page.tsx      # Nova OS (wizard)
├── components/
│   └── forms/
│       └── ServiceOrderForm/
│           ├── index.tsx
│           ├── CustomerStep.tsx
│           ├── EquipmentStep.tsx
│           └── ItemsStep.tsx
└── hooks/
    └── useServiceOrders.ts
```

### Modelos de Dados

[Ver schema Prisma completo acima]

## Implementação

### Frontend - Criar OS

```typescript
// src/app/(dashboard)/os/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceOrderWizard } from '@/components/forms/ServiceOrderForm';

export default function NewServiceOrderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const handleComplete = async (data: ServiceOrderData) => {
    try {
      const response = await fetch('/api/service-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Erro ao criar OS');

      const { serviceOrder } = await response.json();
      router.push(`/os/${serviceOrder.id}`);
    } catch (error) {
      console.error(error);
      // Toast de erro
    }
  };

  return <ServiceOrderWizard onComplete={handleComplete} />;
}
```

### Backend - API Route

```typescript
// src/app/api/service-orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { serviceOrderSchema } from '@/schemas/serviceOrder';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = serviceOrderSchema.parse(body);

    // Criar OS com itens e equipamentos
    const serviceOrder = await prisma.serviceOrder.create({
      data: {
        customerId: validatedData.customerId,
        technicianId: validatedData.technicianId,
        status: 'OPENED',
        equipments: {
          create: validatedData.equipments,
        },
        items: {
          create: validatedData.items.map(item => ({
            ...item,
            totalPrice: item.unitPrice * item.quantity,
          })),
        },
        totalAmount: validatedData.items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0
        ),
      },
      include: {
        customer: true,
        technician: true,
        equipments: true,
        items: true,
      },
    });

    // Decrementar estoque de produtos
    for (const item of validatedData.items) {
      if (item.productId) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: item.quantity } },
        });
      }
    }

    return NextResponse.json({ serviceOrder }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar OS:', error);
    return NextResponse.json(
      { error: 'Erro ao criar ordem de serviço' },
      { status: 500 }
    );
  }
}
```

## API/Endpoints

### POST /api/service-orders

Cria uma nova ordem de serviço.

**Request:**
```json
{
  "customerId": "cuid",
  "technicianId": "cuid",
  "promisedDate": "2024-02-15T18:00:00Z",
  "equipments": [
    {
      "type": "Notebook",
      "brand": "Dell",
      "model": "Inspiron 15",
      "reportedIssue": "Não liga",
      "accessories": "Carregador"
    }
  ],
  "items": [
    {
      "serviceId": "cuid",
      "description": "Formatação Windows",
      "quantity": 1,
      "unitPrice": 150.00
    }
  ]
}
```

**Response (201):**
```json
{
  "serviceOrder": {
    "id": "cuid",
    "orderNumber": "001",
    "status": "OPENED",
    "totalAmount": 150.00,
    "customer": { ... },
    "equipments": [ ... ],
    "items": [ ... ]
  }
}
```

**Erros:**
- 401: Não autenticado
- 400: Dados inválidos
- 500: Erro no servidor

## Segurança

### Validações
- Zod schema valida todos os inputs
- CPF/CNPJ validado no frontend e backend
- Estoque verificado antes de adicionar item

### Autenticação/Autorização
- Apenas usuários autenticados podem criar OS
- RECEPTIONIST e ADMIN podem criar para qualquer técnico
- TECHNICIAN só pode atribuir para si mesmo

### Proteção de Dados
- Fotos armazenadas no Supabase Storage com RLS
- Dados sensíveis (assinatura) criptografados

## Testes

### Unitários
```typescript
describe('calculateServiceOrderTotal', () => {
  it('should sum all items correctly', () => {
    const items = [
      { quantity: 2, unitPrice: 50 },
      { quantity: 1, unitPrice: 100 },
    ];
    expect(calculateTotal(items)).toBe(200);
  });
});
```

### Integração
```typescript
describe('POST /api/service-orders', () => {
  it('should create service order and update stock', async () => {
    const response = await POST(mockRequest);
    expect(response.status).toBe(201);
    
    const product = await prisma.product.findUnique({ ... });
    expect(product.stockQty).toBe(initialStock - 1);
  });
});
```

### E2E
```typescript
test('Create complete service order flow', async ({ page }) => {
  await page.goto('/os/new');
  await page.fill('[name="customer"]', 'João Silva');
  await page.click('button:has-text("Próximo")');
  // ... continuar fluxo
  await page.click('button:has-text("Finalizar")');
  await expect(page).toHaveURL(/\/os\/\w+/);
});
```

## Deploy

### Variáveis de Ambiente
```bash
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Migrations
```bash
npx prisma migrate deploy
```

### Checklist
- [ ] Variáveis configuradas na Vercel
- [ ] Migrations executadas
- [ ] Supabase Storage bucket criado
- [ ] RLS policies ativas

## Monitoramento & Troubleshooting

### Métricas Chave
- Tempo médio de criação de OS: < 2 minutos
- Taxa de erro: < 1%
- OS criadas por dia

### Problemas Comuns

**Erro: "Estoque insuficiente"**
- Verificar stockQty do produto
- Atualizar estoque manualmente se necessário

**OS não aparece na lista**
- Verificar filtros aplicados
- Checar permissões do usuário

**Fotos não fazem upload**
- Verificar configuração Supabase Storage
- Checar políticas de acesso (RLS)
```

---

## 🚀 PRÓXIMOS PASSOS (PÓS-MVP)

1. **App Mobile (PWA):** Tornar o sistema instalável no celular do técnico
2. **Notificações Push:** Alertar técnico quando OS é atribuída a ele
3. **Backup Automático:** Job diário exportando dados para CSV/JSON
4. **Integração WhatsApp Business:** Templates aprovados Meta
5. **Multi-tenancy:** Permitir que outros técnicos usem (SaaS verdadeiro)
6. **Assinatura Digital:** Canvas para cliente assinar na tela ao retirar
7. **Agendamento Online:** Link público para clientes agendarem horário

---

## 💡 DICAS PARA O DESENVOLVIMENTO

1. **Comece pelo banco:** Schema bem definido evita refatorações dolorosas
2. **Use Server Components:** Aproveite o Next.js 14, minimize "use client"
3. **Server Actions:** Para formulários, use `action` nativo do Next.js (sem API routes desnecessárias)
4. **Optimistic UI:** Atualize a interface antes da resposta do servidor (ex: mudar status da OS)
5. **Error Handling:** Sempre use `try/catch` em Server Actions, retorne objetos `{success: boolean, error?: string}`
6. **Type Safety:** Nunca use `any`. Configure Zod para validar inputs de formulários e API
7. **Documentação:** TODA feature nova deve ter documentação em `/docs/features/` antes do merge

---

## 📋 CHECKLIST DE QUALIDADE - TECHASSIST PRO

### Antes de Commitar
- [ ] Código segue ESLint/Prettier
- [ ] TypeScript strict mode sem erros
- [ ] Testes unitários passando
- [ ] Documentação da feature criada/atualizada em `/docs/features/`
- [ ] CHANGELOG.md atualizado
- [ ] Sem console.logs desnecessários
- [ ] Variáveis sensíveis em .env

### Segurança
- [ ] Inputs validados com Zod (frontend E backend)
- [ ] Permissões RBAC verificadas
- [ ] SQL Injection prevention (Prisma)
- [ ] XSS protection (sanitização)
- [ ] HTTPS obrigatório
- [ ] Tokens em httpOnly cookies

### Performance
- [ ] Lighthouse score > 90
- [ ] Queries otimizadas (evitar N+1)
- [ ] Imagens otimizadas (Next.js Image)
- [ ] Lazy loading de componentes pesados
- [ ] Debounce em inputs de busca

### UX
- [ ] Loading states implementados
- [ ] Error messages claras
- [ ] Responsivo mobile/tablet
- [ ] Atalhos de teclado funcionando
- [ ] Notificações toast informativas

### Documentação
- [ ] Feature documentada em `/docs/features/`
- [ ] API endpoints documentados
- [ ] Diagramas incluídos (se necessário)
- [ ] Exemplos de código testados
- [ ] README atualizado
- [ ] `npm run docs:check-all` passou

---

## 📚 RECURSOS E REFERÊNCIAS

- **shadcn/ui:** https://ui.shadcn.com (componentes base)
- **Prisma:** https://prisma.io/docs (ORM)
- **Supabase:** https://supabase.com/docs (BaaS)
- **NextAuth:** https://authjs.dev (Autenticação)
- **react-pdf:** https://react-pdf.org (PDFs)
- **Lucide Icons:** https://lucide.dev (Ícones)
- **Next.js 14:** https://nextjs.org/docs
- **Vercel Deploy:** https://vercel.com/docs

---

## 🎯 RESUMO DAS MELHORIAS TECHASSIST PRO

| Ideia Original | Melhoria Implementada |
|----------------|----------------------|
| Cadastro simples de cliente | Busca inteligente com debounce + cadastro expandido |
| OS básica | Multi-equipamento, fotos, assinatura digital, garantia |
| Status fixos | Status customizáveis via configurações |
| Pagamento na OS | Integração completa com fluxo de caixa e "fiado" |
| Relatórios básicos | Relatórios específicos por perfil (técnico vs admin) |
| - | **Novo:** Controle de estoque com baixa automática |
| - | **Novo:** Etiquetas com QR Code para equipamentos físicos |
| - | **Novo:** Tela simplificada para técnicos (foco em execução) |
| - | **Novo:** Fila de triagem (ordem de chegada) |
| - | **Novo:** Documentação completa em `/docs/` |

---

## 🔧 COMANDOS ÚTEIS - TECHASSIST PRO

```bash
# Development
npm run dev                    # Servidor de desenvolvimento
npm run build                  # Build de produção
npm run start                  # Servidor de produção

# Database
npx prisma generate           # Gerar Prisma Client
npx prisma migrate dev        # Criar migration
npx prisma migrate deploy     # Deploy migrations
npx prisma studio             # Interface admin do banco

# Testing
npm run test                  # Rodar todos os testes
npm run test:unit             # Testes unitários
npm run test:e2e              # Testes E2E

# Code Quality
npm run lint                  # ESLint
npm run format                # Prettier
npm run type-check            # TypeScript

# Documentation
npm run docs:new <feature>    # Criar doc de feature
npm run docs:check-all        # Validar docs
npm run docs:serve            # Servir docs localmente

# Verificação completa antes de commit
npm run lint && npm run test && npm run build && npm run docs:check-all
```

---

*Última atualização: Fevereiro 2026*
*Versão: 2.0.0 - Expandida com TechAssist Pro*
