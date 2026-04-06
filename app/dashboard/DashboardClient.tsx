'use client'

import MetricCard from '@/components/dashboard/MetricCard'
import RecentActivity from '@/components/dashboard/RecentActivity'
import type { ActivityLog } from '@/lib/types'

interface Props {
  agentsActive: number
  tasksRunning: number
  tasksPending: number
  activities: ActivityLog[]
  mcpTotal: number
  mcpConnected: number
  disconnectedMcps: string[]
  autoTotal: number
  autoActive: number
  skillsActive: number
}

export default function DashboardClient({
  agentsActive, tasksRunning, tasksPending, activities,
  mcpTotal, mcpConnected, disconnectedMcps,
  autoTotal, autoActive, skillsActive,
}: Props) {
  const mcpDisconnected = mcpTotal - mcpConnected

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Linha 1 — Agentes, Tarefas, Pendentes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Agentes ativos"
          value={agentsActive}
          icon="🤖"
          color="bg-emerald-50"
        />
        <MetricCard
          label="Tarefas em andamento"
          value={tasksRunning}
          icon="⚡"
          color="bg-blue-50"
        />
        <MetricCard
          label="Pendentes de análise"
          value={tasksPending}
          icon="⏳"
          color="bg-orange-50"
        />
      </div>

      {/* Linha 2 — MCPs, Automações, Skills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="MCPs ativos"
          value={`${mcpConnected}/${mcpTotal}`}
          icon="🔌"
          color={mcpDisconnected > 0 ? 'bg-red-50' : 'bg-emerald-50'}
          detail={`${mcpConnected} conectado${mcpConnected !== 1 ? 's' : ''} de ${mcpTotal} total`}
          alert={mcpDisconnected > 0
            ? `${disconnectedMcps.join(', ')} desconectado${mcpDisconnected > 1 ? 's' : ''}`
            : undefined}
        />
        <MetricCard
          label="Automações"
          value={`${autoActive}/${autoTotal}`}
          icon="⚙️"
          color="bg-violet-50"
          detail={`${autoActive} ativa${autoActive !== 1 ? 's' : ''} de ${autoTotal} total`}
        />
        <MetricCard
          label="Skills ativas"
          value={skillsActive}
          icon="🧠"
          color="bg-sky-50"
        />
      </div>

      <RecentActivity activities={activities} />
    </div>
  )
}
