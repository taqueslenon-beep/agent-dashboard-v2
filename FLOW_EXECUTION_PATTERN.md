# Padrão de Execução de Fluxos (Flow Execution Pattern)

## Visão Geral

Este padrão permite que qualquer fluxo (flow) definido no Supabase possa ser iniciado por usuários através de um formulário dinâmico na interface do painel de agentes.

O sistema é **totalmente genérico** — novos fluxos herdam a funcionalidade automaticamente.

---

## Arquitetura

### Camadas

```
┌─────────────────────────────────────┐
│   UI: FluxosClient (React)          │ Exibe lista de fluxos + botão "Iniciar"
├─────────────────────────────────────┤
│   FlowExecutionModal (React)        │ Coleta parâmetros dinamicamente
├─────────────────────────────────────┤
│   Supabase REST API                 │ Insere task com metadata
├─────────────────────────────────────┤
│   tasks table                       │ Armazena execução + parâmetros
├─────────────────────────────────────┤
│   Agent System (LangGraph/Claude)   │ Processa a task e executa fluxo
└─────────────────────────────────────┘
```

### Fluxo de Dados

1. **User clica "▶ Iniciar Fluxo"** em um fluxo ativo
2. **Modal abre** com formulário dinâmico baseado em `flow.parameters`
3. **User preenche os campos** (valida obrigatórios)
4. **"Iniciar Fluxo" insere task** no Supabase com:
   - `agent_id`: o agente responsável pelo fluxo
   - `name`: nome legível da tarefa
   - `status`: 'pending'
   - `metadata`: JSON com `{ flow_id, flow_name, parameters }`
5. **Agent detecta task** e começa execução
6. **User monitora** na aba "Tarefas" (status: running → completed/error)

---

## Como Definir um Novo Fluxo

### 1. Criar o Fluxo no Supabase

Insert na tabela `flows`:

```sql
INSERT INTO flows (
  name,
  description,
  status,
  department,
  icon,
  tags,
  graph,
  parameters,
  trigger_agent_id,
  requires_approval
) VALUES (
  'Pesquisa Jurisprudencial Completa',
  'Executa pesquisa completa com análise de jurisprudência dominante',
  'active',
  'juridico',
  '📚',
  ARRAY['pesquisa', 'jurisprudencia'],
  '{"nodes": [...], "edges": [...]}',
  '[
    {
      "id": "tema",
      "name": "tema",
      "label": "Tema da Pesquisa",
      "type": "textarea",
      "description": "Descreva o tema com o máximo de detalhes",
      "required": true,
      "placeholder": "Ex: ICMS em operações com energia renovável"
    },
    {
      "id": "prazo_dias",
      "name": "prazo_dias",
      "label": "Prazo (dias)",
      "type": "number",
      "default_value": 5,
      "required": false
    },
    {
      "id": "jurisdicoes",
      "name": "jurisdicoes",
      "label": "Jurisdições",
      "type": "select",
      "description": "Qual tribunal focar?",
      "required": false,
      "options": [
        {"value": "stf", "label": "STF"},
        {"value": "stj", "label": "STJ"},
        {"value": "oab", "label": "Jurisprudência OAB"}
      ]
    }
  ]'::jsonb,
  'advogado-senior-eproc',  -- ID do agente responsável
  false  -- Não requer aprovação
);
```

### 2. Schema da Tabela `flows`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `name` | text | Nome do fluxo (ex: "Pesquisa Jurisprudencial") |
| `description` | text | Descrição legível |
| `status` | enum | 'draft', 'active', 'inactive', 'planned' |
| `department` | text | Departamento responsável |
| `icon` | text | Emoji ou ícone (ex: '📚') |
| `tags` | text[] | Array de tags para categorização |
| `graph` | jsonb | Diagrama LangGraph (nodes + edges) |
| `parameters` | jsonb | Array de parâmetros (veja schema abaixo) |
| `trigger_agent_id` | text | ID do agente que processa este fluxo |
| `requires_approval` | boolean | Se precisa aprovação humana antes de concluir |
| `created_at` | timestamp | Criação |
| `updated_at` | timestamp | Última atualização |

### 3. Schema do Campo `parameters`

Cada parâmetro é um objeto `FlowParameter`:

```typescript
{
  "id": "unique-id",           // Identificador único (usado como key em formData)
  "name": "machine_name",      // Alias interno
  "label": "Nome Legível",     // O que aparece no formulário
  "type": "text|number|email|date|select|textarea",
  "description": "Texto explicativo",  // Opcional, aparece abaixo do campo
  "required": true,            // Campo obrigatório?
  "options": [                 // Só para type="select"
    {"value": "opt1", "label": "Opção 1"},
    {"value": "opt2", "label": "Opção 2"}
  ],
  "placeholder": "Dica de entrada",
  "default_value": "valor padrão"
}
```

---

## Tipos de Parâmetros Suportados

| Type | Renderização | Validação |
|------|--------------|-----------|
| `text` | `<input type="text">` | String |
| `number` | `<input type="number">` | Número |
| `email` | `<input type="email">` | Email válido |
| `date` | `<input type="date">` | ISO date |
| `select` | `<select>` com `options` | Um de N |
| `textarea` | `<textarea rows="4">` | String multilinhas |

---

## Como o Agent Processa a Task

Quando a task é criada, o agente designado em `trigger_agent_id` monitora e processa:

```
1. Detecta task com status='pending'
2. Lê `metadata.parameters` (os valores preenchidos)
3. Executa o fluxo LangGraph definido em `flow.graph`
4. Atualiza task: status='running' → 'completed' | 'error'
5. User vê resultado na aba "Tarefas"
```

---

## Exemplo Completo: "Pesquisa Jurisprudencial Completa"

### 1. Fluxo definido no Supabase

```json
{
  "name": "Pesquisa Jurisprudencial Completa",
  "description": "Análise de jurisprudência dominante com vanguarda",
  "status": "active",
  "department": "juridico",
  "icon": "📚",
  "tags": ["pesquisa", "jurisprudencia"],
  "parameters": [
    {
      "id": "tema",
      "label": "Tema da Pesquisa",
      "type": "textarea",
      "required": true,
      "placeholder": "Ex: ICMS em operações com energia renovável"
    },
    {
      "id": "prazo_dias",
      "label": "Prazo (dias)",
      "type": "number",
      "default_value": 5
    }
  ],
  "trigger_agent_id": "advogado-senior-pesquisa",
  "requires_approval": false
}
```

### 2. User executa no painel

1. Clica "▶ Iniciar Fluxo"
2. Modal abre com 2 campos:
   - "Tema da Pesquisa" (textarea obrigatório)
   - "Prazo (dias)" (número, padrão 5)
3. Preenche tema: "ICMS em operações com energia renovável"
4. Deixa prazo default ou muda para 7 dias
5. Clica "▶ Iniciar Fluxo"

### 3. Task criada

```json
{
  "agent_id": "advogado-senior-pesquisa",
  "name": "Pesquisa Jurisprudencial Completa — ICMS em operações com energia renovável, 7",
  "status": "pending",
  "progress": 0,
  "requires_approval": false,
  "started_at": "2026-04-06T14:30:00Z",
  "metadata": {
    "flow_id": "pesquisa-jurisprudencial-123",
    "flow_name": "Pesquisa Jurisprudencial Completa",
    "parameters": {
      "tema": "ICMS em operações com energia renovável",
      "prazo_dias": 7
    }
  }
}
```

### 4. Agent processa

Agent lê a task, extrai parâmetros, e executa o LangGraph:
- Pesquisa jurisprudência dominante (STF/STJ)
- Analisa vanguarda (teses inovadoras)
- Compila relatório
- Status → running → completed
- User vê resultado na aba "Tarefas"

---

## ReutilizaçãoReutilização em Novos Fluxos

Para adicionar um novo fluxo reutilizando este padrão:

### ✅ Faça

1. **Defina parâmetros no Supabase** usando schema `FlowParameter`
2. **Atribua um `trigger_agent_id`** (agente responsável)
3. **Status deve ser 'active'** para aparecer no painel
4. Pronto! A UI renderiza automaticamente

### ❌ Não faça

- Não crie componentes customizados para cada fluxo
- Não modifique `FlowExecutionModal.tsx` para cada caso
- Não insira tasks manualmente — sempre use o formulário
- Não mude o schema de `parameters` — é fixo e genérico

---

## Validação & Segurança

### No Cliente (Frontend)

- Campos obrigatórios validados antes de enviar
- Tipos de input reforçam tipo esperado (number, email, etc)
- Modal previne env vázios

### No Servidor (Supabase)

- Adicione RLS policies para tabela `tasks`:
  ```sql
  CREATE POLICY "authenticated users can insert tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);
  ```

### No Agent

- Agent valida parâmetros novamente antes de processar
- Loga erro se parâmetro estiver inválido

---

## Monitoramento

Após iniciar fluxo, user pode:

1. **Aba "Tarefas"** — ver status em tempo real
2. **Filtrar por agente** — ver tarefas de um agente específico
3. **Filtrar por status** — ver pending, running, completed, error
4. **Se `requires_approval=true`** — botões de "Aprovar" / "Rejeitar" aparecem

---

## Arquivo Modificado

Este padrão é implementado em:
- `lib/types.ts` — tipos `Flow` e `FlowParameter`
- `app/capacidades/fluxos/FluxosClient.tsx` — UI lista + botão
- `app/capacidades/fluxos/FlowExecutionModal.tsx` — modal reutilizável
- `app/capacidades/fluxos/page.tsx` — server-side fetch

Nenhuma outra mudança é necessária para novos fluxos — é plug-and-play.
