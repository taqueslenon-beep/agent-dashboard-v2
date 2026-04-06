'use client'

import Link from 'next/link'
import type { ActivityLog } from '@/lib/types'
import { STATUS_COLORS } from '@/lib/types'

interface RecentActivityProps {
  activities: ActivityLog[]
}

function formatTime(ts: string) {
  const d = new Date(ts)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function eventIcon(type: string) {
  switch (type) {
    case 'execution': return '▶'
    case 'error': return '✕'
    case 'system': return '⚙'
    case 'mcp_call': return '🔌'
    case 'a2a_message': return '↔'
    case 'human_action': return '👤'
    default: return '·'
  }
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-border p-6 text-center text-muted text-sm">
        Nenhuma atividade recente.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-border">
      <div className="px-5 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-ink">Atividade Recente</h3>
      </div>
      <div className="divide-y divide-border">
        {activities.map((a) => {
          const colors = STATUS_COLORS[a.event_type] ?? STATUS_COLORS.unknown
          return (
            <Link
              key={a.id}
              href="/tarefas"
              className="flex items-center gap-3 px-5 py-3 hover:bg-surface transition-colors"
            >
              <span className="text-base w-5 text-center">{eventIcon(a.event_type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink truncate">{a.action}</p>
                <p className="text-xs text-muted">
                  {a.agent?.name ?? 'Sistema'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                  {a.event_type === 'error' ? 'Erro' : a.event_type === 'execution' ? 'Execução' : 'Sistema'}
                </span>
                <span className="text-xs text-muted font-mono">{formatTime(a.timestamp)}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
