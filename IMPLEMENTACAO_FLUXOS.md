# Implementação: Execução de Fluxos (Questão 5)

**Data**: 2026-04-06
**Status**: ✅ Implementado e pronto para teste
**Padrão**: Reutilizável para todos os fluxos

---

## O que foi implementado

### 1️⃣ **Modal de Execução de Fluxos** (`FlowExecutionModal.tsx`)
- Componente reutilizável que abre quando user clica "▶ Iniciar Fluxo"
- Renderiza formulário **dinâmico** baseado em `flow.parameters`
- Suporta 6 tipos de campos:
  - `text` — texto simples
  - `number` — números
  - `email` — email validado
  - `date` — datas
  - `select` — dropdown com opções
  - `textarea` — texto multilinhas
- Validação de campos obrigatórios
- Feedback visual (loading, erro)

### 2️⃣ **Integração com FluxosClient**
- Botão "▶ Iniciar Fluxo" agora funciona
- Abre modal quando clicado
- Passa o fluxo completo para o modal

### 3️⃣ **Tipos TypeScript**
Adicionados em `lib/types.ts`:
- `FlowParameter` — define estrutura de cada parâmetro
- `Flow` estendido com:
  - `parameters: FlowParameter[] | null`
  - `trigger_agent_id: string | null`
  - `requires_approval: boolean`

### 4️⃣ **Inserção no Supabase**
Quando user clica "Iniciar Fluxo":
1. Modal coleta parâmetros
2. Valida campos obrigatórios
3. Insere em `tasks` com metadata:
   ```json
   {
     "flow_id": "id-do-fluxo",
     "flow_name": "Nome do Fluxo",
     "parameters": { "tema": "...", "prazo_dias": 5 }
   }
   ```
4. Task fica em status `pending` pronta para o agente processar

---

## Arquivos modificados/criados

```
✅ app/capacidades/fluxos/
   ├── FluxosClient.tsx (MODIFICADO)
   │   └── Botão conectado ao modal
   │
   └── FlowExecutionModal.tsx (NOVO)
       └── Componente modal reutilizável

✅ lib/types.ts (MODIFICADO)
   └── Novos tipos: FlowParameter, Flow estendido

📚 DOCUMENTAÇÃO
   ├── FLOW_EXECUTION_PATTERN.md (NOVO)
   │   └── Guia completo + padrão reutilizável
   │
   ├── FLOW_EXAMPLES.sql (NOVO)
   │   └── 3 exemplos de fluxos para testar
   │
   └── IMPLEMENTACAO_FLUXOS.md (ESTE ARQUIVO)
       └── Sumário da implementação
```

---

## Como testar

### 1. Inserir fluxos de exemplo no Supabase

Execute os SQL queries do arquivo `FLOW_EXAMPLES.sql` no console Supabase:

```bash
# Ou via CLI Supabase
supabase db push -- -f FLOW_EXAMPLES.sql
```

Isso cria 3 fluxos:
1. **Pesquisa Jurisprudencial Completa** (4 parâmetros)
2. **Preparação de Dossiê Geográfico** (3 parâmetros)
3. **Redação de Petição Ambiental** (3 parâmetros)

### 2. Acessar o painel

1. Vá para: `/capacidades/fluxos` no dashboard
2. Expanda um fluxo clicando nele
3. Clique no botão "▶ Iniciar Fluxo"
4. Modal deve abrir com os parâmetros

### 3. Preencher formulário e enviar

- Preencha os campos (obrigatórios marcados com `*`)
- Clique "▶ Iniciar Fluxo"
- Task é criada e aparece na aba "Tarefas" com status `pending`

### 4. Monitorar execução

Aba "Tarefas":
- Task aparece com status `pending`
- Quando agente processa: `running` → `completed` / `error`
- Se `requires_approval=true`: aguarda aprovação humana

---

## Padrão reutilizável

O sistema é **100% genérico**. Para adicionar novo fluxo:

### ✅ TUDO que você precisa fazer:

1. **Definir no Supabase** com:
   ```sql
   INSERT INTO flows (
     name,
     description,
     status,      -- deve ser 'active'
     parameters,  -- array de FlowParameter
     trigger_agent_id, -- qual agente processa
     requires_approval -- precisa aprovação?
   ) VALUES (...)
   ```

2. **Pronto!** A UI renderiza automaticamente

### ❌ NÃO é necessário:
- Criar componentes novos
- Modificar `FlowExecutionModal.tsx`
- Implementar validação custom
- Mudar nada no frontend

Essa é a beleza do padrão — **é plug-and-play**.

---

## Fluxo de Dados Completo

```
┌─────────────────────────────────────────────────────┐
│ User clica "▶ Iniciar Fluxo" em um fluxo ativo     │
└────────────────┬──────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ FlowExecutionModal abre (componente reutilizável)  │
│ - Lê flow.parameters do Supabase                   │
│ - Renderiza campos dinamicamente                   │
└────────────────┬──────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ User preenche formulário                            │
│ - Validação de obrigatórios no cliente             │
└────────────────┬──────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ User clica "▶ Iniciar Fluxo"                       │
│ - Modal insere task em supabase.from('tasks')      │
│ - Envia: metadata = { flow_id, parameters }        │
└────────────────┬──────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Task aparece em status 'pending' na aba Tarefas   │
│ - trigger_agent_id começa processamento            │
│ - Lê metadata para extrair parâmetros              │
│ - Executa LangGraph do fluxo                       │
└────────────────┬──────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Task progride: pending → running → completed/error │
│ - User vê progresso na aba Tarefas                 │
│ - Se requires_approval: aguarda HITL               │
└─────────────────────────────────────────────────────┘
```

---

## Próximos passos (opcional)

### Melhorias futuras
1. **Agendamento**: Permitir agendar fluxo para data/hora futura
2. **Duplicação**: Clonar task com mesmos parâmetros
3. **Template**: Salvar presets de parâmetros
4. **Histórico**: Versionar execuções anteriores
5. **Notificações**: Avisar quando fluxo termina

### Para implementar agente que processa fluxos
O agente responsável deve:
1. Monitorar tabela `tasks` onde `agent_id = seu_id`
2. Filtrar tasks com `status = 'pending'`
3. Ler campo `metadata` para extrair parâmetros
4. Executar LangGraph correspondente
5. Atualizar task: `status = 'running'` → `'completed'` ou `'error'`

---

## Arquivos de referência

| Arquivo | Função |
|---------|--------|
| `FLOW_EXECUTION_PATTERN.md` | Guia técnico completo (com exemplos) |
| `FLOW_EXAMPLES.sql` | 3 fluxos prontos para testar |
| `IMPLEMENTACAO_FLUXOS.md` | Este arquivo |
| `FlowExecutionModal.tsx` | Componente modal (reutilizável) |
| `FluxosClient.tsx` | Integração com UI |
| `lib/types.ts` | Tipos TypeScript |

---

## Contatos / Dúvidas

Se encontrar bugs ou quiser melhorias:
1. Cheque `FLOW_EXECUTION_PATTERN.md` — tem schema completo
2. Veja exemplos em `FLOW_EXAMPLES.sql`
3. Teste com os 3 fluxos de exemplo antes de criar novos

---

✅ **Implementação concluída e pronta para uso!**
