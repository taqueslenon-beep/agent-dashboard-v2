# Taques Agents — Painel de Orquestração

Dashboard de orquestração de agentes para o escritório Taques Advogados, implementando os 3 pilares do ecossistema agêntico:

- **MCP** (Model Context Protocol) — agente ↔ ferramentas
- **A2A** (Agent-to-Agent) — agente ↔ agente
- **AG-UI** (Agent-User Interaction) — agente ↔ usuário

## Módulos

| Aba | Descrição |
|-----|-----------|
| **Dashboard** | 3 métricas (agentes ativos, tarefas em andamento, pendentes) + feed de atividades |
| **Tarefas** | Lista cronológica com filtros, barra de progresso e ações HITL (aprovar/rejeitar) |
| **Agentes** | Cards expandíveis por departamento (Jurídico + Técnico), com skills e MCPs vinculados |
| **Capacidades** | 3 subabas: Skills (com toggle), Automações (com toggle), MCPs (status + ferramentas) |
| **Linha do Tempo** | Timeline visual cronológica de todas as atividades do sistema |

## Stack

- **Frontend:** Next.js 16 + React 19 + Tailwind CSS 4
- **Backend:** Supabase (PostgreSQL)
- **Deploy:** Vercel
- **Sync:** `sync-registry.py` (escaneia SKILL.md → Supabase)

## Rodar localmente

```bash
bun install
# criar .env.local com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
bun dev
```

## Deploy

O deploy é automático via Vercel. Cada push para `main` dispara um novo build.

O hook do Claude Code também sincroniza dados: editar um `SKILL.md` → `sync-registry.py` atualiza Supabase → dashboard reflete.

## Banco de dados (Supabase)

```
agents          — id, name, department, level, role, framework, status, description, icon, tags
skills          — id, name, description, type_label, department, icon, tags, status, is_active, path, passos
tasks           — id, agent_id, name, status, progress, requires_approval, error_message, started_at
automations     — id, name, type_label, description, trigger_type, trigger_config, agent_id, tags, status
mcp_servers     — id, name, url, status, tools_available
agent_skills    — agent_id, skill_id (N:N)
agent_mcps      — agent_id, mcp_id (N:N)
activity_log    — id, timestamp, agent_id, action, details, event_type
```

## Paleta de cores

| Cor | Hex | Uso |
|-----|-----|-----|
| Primary | `#223631` | Header, botões ativos, badges |
| Accent | `#4a8c6f` | Links, progresso |
| Cream | `#eae0d5` | Background |
| Beige | `#d6ccc1` | Bordas, separadores |
| Ink | `#0a0908` | Texto principal |
