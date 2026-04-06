'use client'

import MetricCard from '@/components/dashboard/MetricCard'
import RecentActivity from '@/components/dashboard/RecentActivity'
import type { ActivityLog } from '@/lib/types'

interface Props {
  agentsActive: number
  tasksRunning: number
  tasksPending: number
  activities: ActivityLog[]
}

export default function DashboardClient({ agentsActive, tasksRunning, tasksPending, activities }: Props) {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
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
      <RecentActivity activities={activities} />
    </div>
  )
}
