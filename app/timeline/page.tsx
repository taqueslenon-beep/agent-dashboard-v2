import { supabase } from '@/lib/supabase'
import TimelineClient from './TimelineClient'

export const dynamic = 'force-dynamic'

export default async function TimelinePage() {
  const [activityRes, agentsRes] = await Promise.all([
    supabase.from('activity_log').select('*, agent:agents(id, name, icon)').order('timestamp', { ascending: false }).limit(100),
    supabase.from('agents').select('id, name').order('name'),
  ])

  return (
    <TimelineClient
      activities={activityRes.data ?? []}
      agents={agentsRes.data ?? []}
    />
  )
}
