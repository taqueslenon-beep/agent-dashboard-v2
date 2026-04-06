export interface Agent {
  id: string
  name: string
  department: 'juridico' | 'tecnico' | 'geral' | 'administrativo' | 'comercial'
  level: number
  role: string | null
  framework: string
  status: 'active' | 'idle' | 'error' | 'planned' | 'prototype'
  description: string | null
  icon: string | null
  tags: string[]
  last_execution: string | null
  tasks_completed: number
  parent_agent_id: string | null
  created_at: string
  updated_at: string
}

export interface Skill {
  id: string
  name: string
  description: string | null
  type_label: string | null
  department: string
  icon: string | null
  tags: string[]
  status: 'active' | 'prototype' | 'planned' | 'inactive'
  is_active: boolean
  path: string | null
  passos: number
  tem_codigo: boolean
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  agent_id: string | null
  name: string
  status: 'pending' | 'running' | 'completed' | 'error' | 'awaiting_approval'
  progress: number
  requires_approval: boolean
  error_message: string | null
  started_at: string
  completed_at: string | null
  agent?: Agent
}

export interface Automation {
  id: string
  name: string
  type_label: string | null
  description: string | null
  trigger_type: 'cron' | 'event' | 'hook' | 'manual'
  trigger_config: Record<string, unknown>
  agent_id: string | null
  tags: string[]
  status: 'active' | 'inactive' | 'prototype' | 'planned'
  icon: string | null
  is_active: boolean
  last_run: string | null
  created_at: string
}

export interface McpServer {
  id: string
  name: string
  url: string | null
  status: 'connected' | 'disconnected' | 'error' | 'unknown'
  tools_available: string[]
  created_at: string
}

export interface ActivityLog {
  id: string
  timestamp: string
  agent_id: string | null
  action: string
  details: Record<string, unknown>
  event_type: 'mcp_call' | 'a2a_message' | 'human_action' | 'execution' | 'error' | 'system'
  agent?: Agent
}

export type StatusColor = {
  bg: string
  text: string
  dot: string
}

export const STATUS_COLORS: Record<string, StatusColor> = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  idle: { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' },
  running: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  error: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  prototype: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  planned: { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-300' },
  pending: { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' },
  awaiting_approval: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  connected: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  disconnected: { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-300' },
  inactive: { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-300' },
  unknown: { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-300' },
}

export const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  idle: 'Ocioso',
  running: 'Executando',
  completed: 'Concluída',
  error: 'Erro',
  prototype: 'Protótipo',
  planned: 'Planejado',
  pending: 'Pendente',
  awaiting_approval: 'Aguardando Aprovação',
  connected: 'Conectado',
  disconnected: 'Desconectado',
  inactive: 'Inativo',
  unknown: 'Desconhecido',
}
