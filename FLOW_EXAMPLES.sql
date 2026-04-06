-- Exemplos de Fluxos para Teste
-- Execute esses queries no Supabase para popular fluxos de exemplo

-- 1. Pesquisa Jurisprudencial Completa
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
  'Análise de jurisprudência dominante com vanguarda e jurimetria',
  'active',
  'juridico',
  '📚',
  ARRAY['pesquisa', 'jurisprudencia', 'hitl']::text[],
  '{
    "nodes": [
      {"id": "start", "type": "start", "label": "Início"},
      {"id": "extract", "type": "agent", "label": "Extrator E-Proc", "agent_id": "advogado-senior-eproc", "description": "Busca jurisprudência no banco"},
      {"id": "analyze", "type": "agent", "label": "Analisador", "agent_id": "advogado-pleno-analise", "description": "Análise de padrões"},
      {"id": "human_review", "type": "human", "label": "Revisão Jurista", "description": "Validação humana"},
      {"id": "compile", "type": "agent", "label": "Compilador", "agent_id": "estagiario-juridico", "description": "Gera relatório final"},
      {"id": "end", "type": "end", "label": "Fim"}
    ],
    "edges": [
      {"source": "start", "target": "extract"},
      {"source": "extract", "target": "analyze"},
      {"source": "analyze", "target": "human_review"},
      {"source": "human_review", "target": "compile", "condition": "approved"},
      {"source": "compile", "target": "end"},
      {"source": "human_review", "target": "end", "condition": "rejected"}
    ]
  }'::jsonb,
  '[
    {
      "id": "tema",
      "name": "tema",
      "label": "Tema da Pesquisa",
      "type": "textarea",
      "description": "Descreva o tema jurídico com máximo de detalhes",
      "required": true,
      "placeholder": "Ex: ICMS em operações com energia renovável"
    },
    {
      "id": "prazo_dias",
      "name": "prazo_dias",
      "label": "Prazo em Dias",
      "type": "number",
      "description": "Quantos dias para conclusão?",
      "required": false,
      "default_value": 5
    },
    {
      "id": "tribunais",
      "name": "tribunais",
      "label": "Tribunais Prioritários",
      "type": "select",
      "description": "Qual tribunal focar na pesquisa?",
      "required": false,
      "options": [
        {"value": "stf", "label": "STF"},
        {"value": "stj", "label": "STJ"},
        {"value": "trf4", "label": "TRF-4"},
        {"value": "tjsc", "label": "TJSC"}
      ]
    },
    {
      "id": "inclui_vanguarda",
      "name": "inclui_vanguarda",
      "label": "Incluir Análise de Vanguarda?",
      "type": "select",
      "required": false,
      "options": [
        {"value": "sim", "label": "Sim"},
        {"value": "nao", "label": "Não"}
      ],
      "default_value": "sim"
    }
  ]'::jsonb,
  'advogado-senior-pesquisa',
  true
) ON CONFLICT DO NOTHING;

-- 2. Preparação de Dossiê Geográfico
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
  'Preparação de Dossiê Geográfico',
  'Coleta, validação e organização de dados geográficos de propriedades',
  'active',
  'tecnico',
  '🗺️',
  ARRAY['geo', 'car', 'dossie']::text[],
  '{
    "nodes": [
      {"id": "start", "type": "start", "label": "Início"},
      {"id": "extract_car", "type": "agent", "label": "Extrator CAR", "agent_id": "analista-tecnico-car"},
      {"id": "validate_geo", "type": "agent", "label": "Validação Geo", "agent_id": "analista-tecnico-gis"},
      {"id": "organize", "type": "agent", "label": "Organizador", "agent_id": "estagiario-tecnico"},
      {"id": "end", "type": "end", "label": "Dossiê Pronto"}
    ],
    "edges": [
      {"source": "start", "target": "extract_car"},
      {"source": "extract_car", "target": "validate_geo"},
      {"source": "validate_geo", "target": "organize"},
      {"source": "organize", "target": "end"}
    ]
  }'::jsonb,
  '[
    {
      "id": "imovel_id",
      "name": "imovel_id",
      "label": "ID do Imóvel",
      "type": "text",
      "description": "Identificador único da propriedade",
      "required": true,
      "placeholder": "Ex: PROP-2026-0001"
    },
    {
      "id": "matricula",
      "name": "matricula",
      "label": "Matrícula Imobiliária",
      "type": "text",
      "description": "Número da matrícula no cartório",
      "required": false,
      "placeholder": "Ex: 123456"
    },
    {
      "id": "incluir_mapbiomas",
      "name": "incluir_mapbiomas",
      "label": "Incluir Dados MapBiomas?",
      "type": "select",
      "required": true,
      "options": [
        {"value": "sim", "label": "Sim"},
        {"value": "nao", "label": "Não"}
      ]
    }
  ]'::jsonb,
  'analista-senior-geo',
  false
) ON CONFLICT DO NOTHING;

-- 3. Redação de Petição Ambiental
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
  'Redação de Petição Ambiental',
  'Geração automática de petição com citações jurisprudenciais',
  'active',
  'juridico',
  '⚖️',
  ARRAY['redacao', 'peticao', 'ambiental']::text[],
  '{
    "nodes": [
      {"id": "start", "type": "start", "label": "Início"},
      {"id": "draft", "type": "agent", "label": "Redator IA", "agent_id": "redacao-juridica-ai"},
      {"id": "review", "type": "human", "label": "Revisão Advogado", "description": "Revisão e ajustes"},
      {"id": "finalize", "type": "agent", "label": "Formatador", "agent_id": "estagiario-juridico"},
      {"id": "end", "type": "end", "label": "Petição Pronta"}
    ],
    "edges": [
      {"source": "start", "target": "draft"},
      {"source": "draft", "target": "review"},
      {"source": "review", "target": "finalize", "condition": "approved"},
      {"source": "finalize", "target": "end"},
      {"source": "review", "target": "draft", "condition": "rejected"}
    ]
  }'::jsonb,
  '[
    {
      "id": "tipo_acao",
      "name": "tipo_acao",
      "label": "Tipo de Ação",
      "type": "select",
      "description": "Qual tipo de petição?",
      "required": true,
      "options": [
        {"value": "ordinaria", "label": "Ordinária"},
        {"value": "cautelar", "label": "Cautelar"},
        {"value": "recurso", "label": "Recurso"}
      ]
    },
    {
      "id": "materia",
      "name": "materia",
      "label": "Matéria Jurídica",
      "type": "select",
      "required": true,
      "options": [
        {"value": "licenciamento", "label": "Licenciamento Ambiental"},
        {"value": "responsabilidade", "label": "Responsabilidade Civil"},
        {"value": "penal", "label": "Direito Penal Ambiental"}
      ]
    },
    {
      "id": "resumo_fatos",
      "name": "resumo_fatos",
      "label": "Resumo dos Fatos",
      "type": "textarea",
      "description": "Histórico do caso em 2-3 parágrafos",
      "required": true,
      "placeholder": "Descreva os fatos relevantes..."
    }
  ]'::jsonb,
  'advogado-pleno-redacao',
  true
) ON CONFLICT DO NOTHING;

-- Consultar fluxos criados
SELECT
  name,
  status,
  department,
  icon,
  (parameters::text)::json -> 0 ->> 'label' as primeiro_parametro,
  (graph->'nodes')::text::jsonb @> '[{"type": "human"}]'::jsonb as tem_hitl
FROM flows
WHERE name IN ('Pesquisa Jurisprudencial Completa', 'Preparação de Dossiê Geográfico', 'Redação de Petição Ambiental')
ORDER BY name;
