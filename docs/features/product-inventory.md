# ✅ Produtos & Estoque

- **Status:** ✅ Completo
- **Versão:** 1.0.0
- **Data:** 2026-02-09

## 📝 Visão Geral
Gestão de peças, componentes e produtos para venda. Inclui controle de estoque mínimo e baixa automática em vendas e ordens de serviço.

## 🏗️ Regras de Negócio
- **Alerta de Estoque:** Itens abaixo do `minStock` são destacados visualmente.
- **Baixa Automática:** O estoque é decrementado em transações de venda aprovadas.

## 💻 Modelo de Dados (Prisma)
```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  costPrice   Decimal
  salePrice   Decimal
  stockQty    Int      @default(0)
  minStock    Int      @default(5)
  // ...
}
```

## 📄 Funcionalidades
- Cadastro de fornecedores vinculados.
- Histórico de entradas e saídas.
- Cálculo automático de margem de lucro.
