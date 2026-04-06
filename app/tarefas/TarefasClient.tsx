'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Task, Agent } from '@/lib/types'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/types'

interface Props {
  tasks: Task[]
  agents: Pick<Agent, 'id' | 'name'>[]
}

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.unknown
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

export default function TarefasClient({ tasks: initialTasks, agents }: Props) {
  const [tasks, setTasks] = useState(initialTasks)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [agentFilter, setAgentFilter] = useState<string>('all')

  const filtered = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (agentFilter !== 'all' && t.agent_id !== agentFilter) return false
    return true
  })

  async function handleAction(taskId: string, action: 'approve' | 'reject') {
    const newStatus = action === 'approve' ? 'completed' : 'error'
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus, completed_at: new Date().toISOString() })
      .eq('id', taskId)

    if (!error) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as Task['status'], completed_at: new Date().toISOString() } : t))
      )
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-white text-ink"
        >
          <option value="all">Todos os status</option>
          <option value="running">Executando</option>
          <option value="completed">Concluída</option>
          <option value="error">Erro</option>
          <option value="awaiting_approval">Aguardando Aprovação</option>
          <option value="pending">Pendente</option>
        </select>
        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-white text-ink"
        >
          <option value="all">Todos os agentes</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <span className="text-xs text-muted ml-auto">{filtered.length} tarefa(s)</span>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-border p-12 text-center text-muted text-sm">
          Nenhuma tarefa encontrada.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <div key={task.id} className="bg-white rounded-lg border border-border p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{task.name}</p>
                <p className="text-xs text-muted mt-0.5">
                  {task.agent?.name ?? 'Sem agente'} · {new Date(task.started_at).toLocaleString('pt-BR')}
                </p>
              </div>
              {task.status === 'running' && task.progress > 0 && (
                <div className="w-24">
                  <div className="h-1.5 bg-surface-alt rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                  </div>
                  <p className="text-[10px] text-muted text-right mt-0.5">{task.progress}%</p>
                </div>
              )}
              <StatusBadge status={task.status} />
              {task.status === 'awaiting_approval' && (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleAction(task.id, 'approve')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    Aprovar
                  </button>
                  <button
                    onClick={() => handleAction(task.id, 'reject')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Rejeitar
                  </button>
                </div>
              )}
              {task.status === 'error' && task.error_message && (
                <span className="text-xs text-red-600 max-w-48 truncate" title={task.error_message}>
                  {task.error_message}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
