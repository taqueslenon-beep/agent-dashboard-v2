import { supabase } from '@/lib/supabase'
import TarefasClient from './TarefasClient'

export const dynamic = 'force-dynamic'

export default async function TarefasPage() {
  const [tasksRes, agentsRes] = await Promise.all([
    supabase.from('tasks').select('*, agent:agents(id, name, icon)').order('started_at', { ascending: false }).limit(50),
    supabase.from('agents').select('id, name').order('name'),
  ])

  return (
    <TarefasClient
      tasks={tasksRes.data ?? []}
      agents={agentsRes.data ?? []}
    />
  )
}
