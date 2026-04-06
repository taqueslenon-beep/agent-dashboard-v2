import { supabase } from '@/lib/supabase'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [agentsRes, tasksRunning, tasksPending, activityRes] = await Promise.all([
    supabase.from('agents').select('id', { count: 'exact' }).in('status', ['active', 'prototype']),
    supabase.from('tasks').select('id', { count: 'exact' }).eq('status', 'running'),
    supabase.from('tasks').select('id', { count: 'exact' }).in('status', ['awaiting_approval', 'error']),
    supabase.from('activity_log').select('*, agent:agents(id, name, icon)').order('timestamp', { ascending: false }).limit(5),
  ])

  return (
    <DashboardClient
      agentsActive={agentsRes.count ?? 0}
      tasksRunning={tasksRunning.count ?? 0}
      tasksPending={tasksPending.count ?? 0}
      activities={activityRes.data ?? []}
    />
  )
}
