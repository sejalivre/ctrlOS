# ✅ Gestão de Clientes

- **Status:** ✅ Completo
- **Versão:** 1.0.0
- **Data:** 2026-02-09

## 📝 Visão Geral
Módulo responsável pelo cadastro e manutenção da base de clientes da assistência técnica. Permite o rastreamento de contatos, endereços e histórico de interações.

### User Stories
- Como recepcionista, quero cadastrar clientes rapidamente para abrir uma OS.
- Como técnico, quero visualizar o histórico de um cliente para entender problemas recorrentes.

## 🏗️ Arquitetura
- **Página:** `/customers`
- **Componentes:** `CustomerTable`, `CustomerDialog`, `CustomerForm`
- **API:** `/api/customers`

## 💻 Implementação
O módulo utiliza `react-hook-form` e `zod` para validação de campos obrigatórios como nome e telefone.

### Schema (Zod)
```typescript
export const customerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(10, "Telefone inválido"),
  email: z.string().email().optional().nullable(),
  // ... outros campos
});
```

## 📄 API Endpoints
- `GET /api/customers?q=pesquisa`: Lista clientes com filtro.
- `POST /api/customers`: Cria novo cliente.
- `PATCH /api/customers/[id]`: Atualiza dados.
- `DELETE /api/customers/[id]`: Remove cliente.
