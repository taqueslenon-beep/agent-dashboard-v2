'use client'

import { useState } from 'react'
import type { Agent, Skill, McpServer } from '@/lib/types'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/types'

interface Props {
  agents: Agent[]
  skills: Pick<Skill, 'id' | 'name' | 'icon'>[]
  mcps: Pick<McpServer, 'id' | 'name' | 'status'>[]
  agentSkills: { agent_id: string; skill_id: string }[]
  agentMcps: { agent_id: string; mcp_id: string }[]
}

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.unknown
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

function DeptBadge({ dept }: { dept: string }) {
  const colors = dept === 'juridico'
    ? 'bg-indigo-50 text-indigo-700'
    : 'bg-teal-50 text-teal-700'
  const label = dept === 'juridico' ? 'Jurídico' : 'Técnico'
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colors}`}>{label}</span>
}

export default function AgentesClient({ agents, skills, mcps, agentSkills, agentMcps }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const departments = {
    juridico: agents.filter((a) => a.department === 'juridico'),
    tecnico: agents.filter((a) => a.department === 'tecnico'),
  }

  function getAgentSkills(agentId: string) {
    const ids = agentSkills.filter((r) => r.agent_id === agentId).map((r) => r.skill_id)
    return skills.filter((s) => ids.includes(s.id))
  }

  function getAgentMcps(agentId: string) {
    const ids = agentMcps.filter((r) => r.agent_id === agentId).map((r) => r.mcp_id)
    return mcps.filter((m) => ids.includes(m.id))
  }

  function renderAgent(agent: Agent) {
    const isExpanded = expanded === agent.id
    const linkedSkills = getAgentSkills(agent.id)
    const linkedMcps = getAgentMcps(agent.id)

    return (
      <div key={agent.id} className="bg-white rounded-lg border border-border overflow-hidden">
        <button
          onClick={() => setExpanded(isExpanded ? null : agent.id)}
          className="w-full px-5 py-4 flex items-center gap-4 hover:bg-surface/50 transition-colors text-left"
        >
          <span className="text-2xl">{agent.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-ink">{agent.name}</p>
              <StatusBadge status={agent.status} />
            </div>
            <p className="text-xs text-muted mt-0.5">{agent.role} · {agent.framework}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted">{agent.tasks_completed} tarefas</p>
            {agent.last_execution && (
              <p className="text-[10px] text-muted">
                Último: {new Date(agent.last_execution).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
          <svg className={`w-4 h-4 text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="px-5 pb-4 border-t border-border pt-4 space-y-4">
            {agent.description && (
              <p className="text-sm text-muted">{agent.description}</p>
            )}

            <div className="flex flex-wrap gap-1.5">
              {agent.tags.map((tag) => (
                <span key={tag} className="text-[11px] px-2 py-0.5 rounded bg-surface text-muted">{tag}</span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-ink mb-2">Skills vinculadas</p>
                {linkedSkills.length === 0 ? (
                  <p className="text-xs text-muted">Nenhuma</p>
                ) : (
                  <div className="space-y-1">
                    {linkedSkills.map((s) => (
                      <div key={s.id} className="text-xs flex items-center gap-1.5">
                        <span>{s.icon}</span> {s.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-ink mb-2">MCPs conectados</p>
                {linkedMcps.length === 0 ? (
                  <p className="text-xs text-muted">Nenhum</p>
                ) : (
                  <div className="space-y-1">
                    {linkedMcps.map((m) => (
                      <div key={m.id} className="text-xs flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_COLORS[m.status]?.dot ?? 'bg-slate-300'}`} />
                        {m.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {Object.entries(departments).map(([dept, deptAgents]) => (
        <section key={dept}>
          <div className="flex items-center gap-2 mb-3">
            <DeptBadge dept={dept} />
            <h2 className="text-sm font-semibold text-ink">
              {dept === 'juridico' ? 'Departamento Jurídico' : 'Departamento Técnico'}
            </h2>
            <span className="text-xs text-muted">({deptAgents.length} agentes)</span>
          </div>
          <div className="space-y-2">
            {deptAgents.map(renderAgent)}
          </div>
        </section>
      ))}
    </div>
  )
}
