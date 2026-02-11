# ✅ Ordens de Serviço (OS)

- **Status:** ✅ Completo
- **Versão:** 2.0.0
- **Data:** 2026-02-09
- **Última Atualização:** 2026-02-10 (Adicionada edição completa com produtos/serviços e pagamento)

## 📝 Visão Geral
Módulo central do sistema para controle de assistência técnica. Gerencia o fluxo completo desde a entrada do equipamento até a entrega ao cliente, incluindo edição completa com produtos, serviços e controle de pagamento.

## 🏗️ Automatização de Status
O sistema segue o seguinte workflow:
`ABERTA` → `EM FILA` → `EM ANDAMENTO` → `PRONTA` → `ENTREGUE`

## 💻 Principais Entidades
- **ServiceOrder:** Registro principal da OS.
- **Equipment:** Equipamento vinculado à OS (tipo, marca, modelo, problema).
- **ServiceOrderItem:** Produtos e serviços utilizados na OS.
- **PaymentMethod:** Método de pagamento utilizado.

## 🚀 Novas Funcionalidades (v2.0.0)

### ✏️ Edição Completa de OS
- **Ícone de edição** na tabela de ordens de serviço
- **Página de edição** em `/os/[id]/edit`
- **Formulário completo** com diagnóstico e solução
- **Adição dinâmica** de produtos e serviços
- **Cálculos automáticos** de totais
- **Seleção de método de pagamento**

### 📋 Fluxo de Edição
1. Clique no ícone de edição (✏️) na tabela de OS
2. Acesse a página de edição `/os/[id]/edit`
3. Edite informações do equipamento (diagnóstico, solução)
4. Adicione/remova produtos e serviços
5. Selecione método de pagamento
6. Visualize cálculos automáticos
7. Salve as alterações

### 💰 Sistema de Pagamento
- **Métodos suportados:** Dinheiro, Cartão de Crédito, Cartão de Débito, PIX, Transferência
- **Cálculos automáticos:** Subtotal, Desconto, Total
- **Integração financeira:** Registro automático no controle financeiro

## 📄 API Endpoints
- `GET /api/os`: Lista todas as ordens.
- `POST /api/os`: Abre nova ordem com equipamentos e itens.
- `GET /api/os/[id]`: Detalhes completos.
- `PUT /api/os/[id]`: **ATUALIZADO** - Edição completa com produtos, serviços e pagamento.
- `PATCH /api/os/[id]`: Atualiza status ou dados da ordem.

## 🔧 Endpoint PUT `/api/os/[id]` (Atualizado)
```json
{
  "customerId": "string",
  "priority": "LOW|NORMAL|HIGH|URGENT",
  "equipments": [
    {
      "type": "string",
      "brand": "string",
      "model": "string",
      "reportedIssue": "string",
      "diagnosis": "string",
      "solution": "string"
    }
  ],
  "items": [
    {
      "productId": "string | null",
      "serviceId": "string | null",
      "description": "string",
      "quantity": "number",
      "unitPrice": "number",
      "totalPrice": "number"
    }
  ],
  "paymentMethod": "CASH|CREDIT_CARD|DEBIT_CARD|PIX|TRANSFER",
  "subtotal": "number",
  "discount": "number",
  "total": "number"
}
```

## 🎨 Interface do Usuário

### Tabela de OS
- Ícone de edição (✏️) em cada linha
- Visualização rápida de status e prioridade
- Filtros e busca integrados

### Formulário de Edição
- **Seção 1:** Informações do cliente e prioridade
- **Seção 2:** Equipamento (tipo, marca, modelo, problema)
- **Seção 3:** Diagnóstico e solução técnica
- **Seção 4:** Produtos e serviços (adição dinâmica)
- **Seção 5:** Cálculos financeiros (subtotal, desconto, total)
- **Seção 6:** Método de pagamento
- **Botões:** Cancelar e Salvar Alterações

## 🧪 Testes Realizados
- ✅ Adição/remoção de produtos e serviços
- ✅ Cálculos automáticos de totais
- ✅ Seleção de método de pagamento
- ✅ Salvamento via API PUT
- ✅ Compatibilidade com SQLite
- ✅ Build de produção (Vercel)

## 📁 Estrutura de Arquivos
```
src/
├── app/(dashboard)/os/[id]/edit/page.tsx      # Página de edição
├── components/forms/OSEditForm.tsx           # Formulário principal
├── components/tables/OSTable.tsx             # Tabela com ícone de edição
└── app/api/os/[id]/route.ts                  # Endpoint PUT atualizado
```
