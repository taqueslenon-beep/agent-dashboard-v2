import { supabase } from '@/lib/supabase'
import AgentesClient from './AgentesClient'

export const dynamic = 'force-dynamic'

export default async function AgentesPage() {
  const [agentsRes, skillsRes, mcpsRes, agentSkillsRes, agentMcpsRes] = await Promise.all([
    supabase.from('agents').select('*').order('department').order('level'),
    supabase.from('skills').select('id, name, icon'),
    supabase.from('mcp_servers').select('id, name, status'),
    supabase.from('agent_skills').select('agent_id, skill_id'),
    supabase.from('agent_mcps').select('agent_id, mcp_id'),
  ])

  return (
    <AgentesClient
      agents={agentsRes.data ?? []}
      skills={skillsRes.data ?? []}
      mcps={mcpsRes.data ?? []}
      agentSkills={agentSkillsRes.data ?? []}
      agentMcps={agentMcpsRes.data ?? []}
    />
  )
}
