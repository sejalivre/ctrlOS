# ✅ Configurações do Sistema

- **Status:** ✅ Completo
- **Versão:** 1.0.0
- **Data:** 2026-02-09

## 📝 Visão Geral
Gerenciamento da identidade e parâmetros globais da aplicação.

## 🏗️ Campos Configuráveis
- Nome da Empresa, Logo e Contatos (exibidos em comprovantes).
- Moeda Padrão (ex: BRL).
- Rodapé personalizado para documentos PDF.

## 💻 Persistência
Utiliza o modelo `SystemSettings` no Prisma com um ID único fixo (`global`) para garantir configuração única por instância.
