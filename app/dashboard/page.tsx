import { supabase } from '@/lib/supabase'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [
    agentsRes,
    tasksRunning,
    tasksPending,
    activityRes,
    mcpsRes,
    autoRes,
    skillsRes,
  ] = await Promise.all([
    supabase.from('agents').select('id', { count: 'exact' }).in('status', ['active', 'prototype']),
    supabase.from('tasks').select('id', { count: 'exact' }).eq('status', 'running'),
    supabase.from('tasks').select('id', { count: 'exact' }).in('status', ['awaiting_approval', 'error']),
    supabase.from('activity_log').select('*, agent:agents(id, name, icon)').order('timestamp', { ascending: false }).limit(5),
    supabase.from('mcp_servers').select('id, name, status'),
    supabase.from('automations').select('id, name, status'),
    supabase.from('skills').select('id', { count: 'exact' }).eq('status', 'active'),
  ])

  const mcps = mcpsRes.data ?? []
  const mcpTotal = mcps.length
  const mcpConnected = mcps.filter(m => m.status === 'connected').length
  const disconnectedMcps = mcps.filter(m => m.status !== 'connected').map(m => m.name)

  const automations = autoRes.data ?? []
  const autoTotal = automations.length
  const autoActive = automations.filter(a => a.status === 'active').length

  return (
    <DashboardClient
      agentsActive={agentsRes.count ?? 0}
      tasksRunning={tasksRunning.count ?? 0}
      tasksPending={tasksPending.count ?? 0}
      activities={activityRes.data ?? []}
      mcpTotal={mcpTotal}
      mcpConnected={mcpConnected}
      disconnectedMcps={disconnectedMcps}
      autoTotal={autoTotal}
      autoActive={autoActive}
      skillsActive={skillsRes.count ?? 0}
    />
  )
}
