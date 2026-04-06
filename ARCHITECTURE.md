# Arquitetura — Taques Agents

## Diagrama

```mermaid
graph TD
    subgraph "Fontes de Dados"
        SK[".claude/skills/*/SKILL.md"]
        SYNC["sync-registry.py"]
        SK -->|escaneia| SYNC
    end

    subgraph "Armazenamento"
        SB["Supabase (PostgreSQL)"]
        RJ["registry.json (legado)"]
        SYNC -->|REST API| SB
        SYNC -->|arquivo| RJ
    end

    subgraph "Frontend (Next.js 16)"
        DASH["Dashboard"]
        TAR["Tarefas"]
        AGE["Agentes"]
        CAP["Capacidades"]
        TL["Timeline"]
    end

    SB -->|fetch SSR| DASH
    SB -->|fetch SSR| TAR
    SB -->|fetch SSR| AGE
    SB -->|fetch SSR| CAP
    SB -->|fetch SSR| TL

    subgraph "Deploy"
        VC["Vercel"]
        GH["GitHub"]
    end

    GH -->|auto-deploy| VC

    subgraph "Trigger"
        CC["Claude Code Hook"]
        CC -->|PostToolUse| SYNC
    end
```

## Fluxo de dados

1. Usuário edita `SKILL.md` via Claude Code
2. Hook `PostToolUse` dispara `sync-registry.py`
3. Script escaneia skills, gera `registry.json` e sincroniza Supabase
4. Dashboard Next.js busca dados do Supabase via SSR (server-side rendering)
5. Páginas são dinâmicas (`force-dynamic`) — sempre dados frescos

## Protocolos implementados

| Protocolo | Status | Implementação |
|-----------|--------|--------------|
| **AG-UI** | v0.1 | Dashboard visual + HITL (aprovar/rejeitar tarefas) |
| **MCP** | Listagem | Inventário de MCPs conectados com status e ferramentas |
| **A2A** | Planejado | Registrado na activity_log, sem comunicação real entre agentes ainda |

## Decisões técnicas

- **Next.js 16 + Supabase** em vez de HTML estático: permite CRUD, filtros e dados persistentes
- **`force-dynamic`** em todas as páginas: dashboard precisa de dados sempre atualizados
- **Supabase anon key** (público): RLS configurado — read-only para tabelas sensíveis
- **`sync-registry.py` dual-write**: mantém registry.json (v1) e Supabase (v2) simultaneamente
- **Bun** como package manager: mais rápido que npm, sem problemas de cache
