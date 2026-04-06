'use client'

import { useState } from 'react'
import type { ActivityLog, Agent } from '@/lib/types'
import { STATUS_COLORS } from '@/lib/types'

interface Props {
  activities: ActivityLog[]
  agents: Pick<Agent, 'id' | 'name'>[]
}

const EVENT_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  execution: { icon: '▶', label: 'Execução', color: 'border-emerald-400' },
  error: { icon: '✕', label: 'Erro', color: 'border-red-400' },
  system: { icon: '⚙', label: 'Sistema', color: 'border-slate-400' },
  mcp_call: { icon: '🔌', label: 'Chamada MCP', color: 'border-blue-400' },
  a2a_message: { icon: '↔', label: 'A2A', color: 'border-purple-400' },
  human_action: { icon: '👤', label: 'Ação Humana', color: 'border-orange-400' },
}

const PERIODS = [
  { value: 'today', label: 'Hoje' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: 'all', label: 'Tudo' },
]

function getDateLimit(period: string): Date | null {
  const now = new Date()
  switch (period) {
    case 'today': return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case '7d': return new Date(now.getTime() - 7 * 86400000)
    case '30d': return new Date(now.getTime() - 30 * 86400000)
    default: return null
  }
}

export default function TimelineClient({ activities, agents }: Props) {
  const [period, setPeriod] = useState('all')
  const [agentFilter, setAgentFilter] = useState('all')

  const limit = getDateLimit(period)
  const filtered = activities.filter((a) => {
    if (limit && new Date(a.timestamp) < limit) return false
    if (agentFilter !== 'all' && a.agent_id !== agentFilter) return false
    return true
  })

  let lastDate = ''

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                period === p.value
                  ? 'bg-primary text-cream'
                  : 'bg-white text-muted border border-border hover:text-ink'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white text-ink"
        >
          <option value="all">Todos os agentes</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <span className="text-xs text-muted ml-auto">{filtered.length} evento(s)</span>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-border p-12 text-center text-muted text-sm">
          Nenhum evento no período selecionado.
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-0">
            {filtered.map((activity) => {
              const cfg = EVENT_CONFIG[activity.event_type] ?? EVENT_CONFIG.system
              const date = new Date(activity.timestamp).toLocaleDateString('pt-BR')
              const time = new Date(activity.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              const showDate = date !== lastDate
              lastDate = date

              return (
                <div key={activity.id}>
                  {showDate && (
                    <div className="relative pl-12 py-2">
                      <span className="text-xs font-semibold text-ink">{date}</span>
                    </div>
                  )}
                  <div className="relative pl-12 py-2 flex items-start gap-3">
                    <div className={`absolute left-3.5 top-3 h-3 w-3 rounded-full border-2 bg-white ${cfg.color}`} />
                    <div className="flex-1 bg-white rounded-lg border border-border p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{cfg.icon}</span>
                        <p className="text-sm font-medium text-ink flex-1">{activity.action}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface text-muted">{cfg.label}</span>
                        <span className="text-xs font-mono text-muted">{time}</span>
                      </div>
                      <p className="text-xs text-muted mt-1">
                        {activity.agent?.name ?? 'Sistema'}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
