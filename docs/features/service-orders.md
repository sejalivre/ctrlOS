# ✅ Ordens de Serviço (OS)

- **Status:** ✅ Completo
- **Versão:** 1.0.0
- **Data:** 2026-02-09

## 📝 Visão Geral
Módulo central do sistema para controle de assistência técnica. Gerencia o fluxo completo desde a entrada do equipamento até a entrega ao cliente.

## 🏗️ Automatização de Status
O sistema segue o seguinte workflow:
`ABERTA` → `EM FILA` → `EM ANDAMENTO` → `PRONTA` → `ENTREGUE`

## 💻 Principais Entidades
- **ServiceOrder:** Registro principal da OS.
- **Equipment:** Equipamento vinculado à OS (tipo, marca, modelo, problema).
- **ServiceOrderItem:** Produtos e serviços utilizados na OS.

## 📄 API Endpoints
- `GET /api/os`: Lista todas as ordens.
- `POST /api/os`: Abre nova ordem com equipamentos e itens.
- `GET /api/os/[id]`: Detalhes completos.
- `PATCH /api/os/[id]`: Atualiza status ou dados da ordem.
