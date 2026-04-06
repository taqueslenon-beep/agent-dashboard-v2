'use client'

import { useState } from 'react'
import type { Agent, Skill, McpServer, Automation } from '@/lib/types'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/types'
import Organograma from './Organograma'

interface Props {
  agents: Agent[]
  skills: Pick<Skill, 'id' | 'name' | 'icon'>[]
  mcps: Pick<McpServer, 'id' | 'name' | 'status'>[]
  agentSkills: { agent_id: string; skill_id: string }[]
  agentMcps: { agent_id: string; mcp_id: string }[]
  automations: Pick<Automation, 'id' | 'name' | 'icon' | 'status' | 'agent_id' | 'trigger_type' | 'trigger_config'>[]
}

type ViewMode = 'organograma' | 'lista'

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.unknown
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

const DEPT_CONFIG: Record<string, { colors: string; label: string; order: number }> = {
  'gabinete-ceo': { colors: 'bg-violet-50 text-violet-700', label: 'Gabinete do CEO', order: 0 },
  juridico: { colors: 'bg-indigo-50 text-indigo-700', label: 'Jurídico', order: 1 },
  tecnico: { colors: 'bg-teal-50 text-teal-700', label: 'Técnico', order: 2 },
  administrativo: { colors: 'bg-amber-50 text-amber-700', label: 'Administrativo', order: 3 },
  comercial: { colors: 'bg-rose-50 text-rose-700', label: 'Comercial', order: 4 },
  inteligencia: { colors: 'bg-yellow-50 text-yellow-700', label: 'Inteligência', order: 5 },
}

const NUCLEUS_CONFIG: Record<string, { colors: string; label: string; icon: string; order: number }> = {
  ambiental: { colors: 'bg-emerald-50 text-emerald-700', label: 'Núcleo de Direito Ambiental', icon: '🌿', order: 0 },
  cobrancas: { colors: 'bg-blue-50 text-blue-700', label: 'Núcleo de Cobranças e Recuperação', icon: '💰', order: 1 },
  generalista: { colors: 'bg-slate-50 text-slate-600', label: 'Núcleo Generalista', icon: '⚖️', order: 2 },
}

function DeptBadge({ dept }: { dept: string }) {
  const cfg = DEPT_CONFIG[dept] ?? { colors: 'bg-slate-50 text-slate-600', label: dept }
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.colors}`}>{cfg.label}</span>
}

function NucleusBadge({ nucleus }: { nucleus: string }) {
  const cfg = NUCLEUS_CONFIG[nucleus] ?? { colors: 'bg-slate-50 text-slate-600', label: nucleus, icon: '📁' }
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.colors}`}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

function formatCron(config: Record<string, unknown> | null): string {
  if (!config) return ''
  const cron = config.cron as string | undefined
  if (!cron) return ''
  const parts = cron.split(' ')
  if (parts.length < 5) return cron
  const hours = parts[1]
  const dow = parts[4]
  const hourList = hours.split(',').map((h) => `${h}h`).join(', ')
  const dayMap: Record<string, string> = { '1-5': 'seg-sex', '*': 'diário', '1': 'seg', '5': 'sex' }
  const days = dayMap[dow] ?? dow
  return `${hourList} · ${days}`
}

export default function AgentesClient({ agents, skills, mcps, agentSkills, agentMcps, automations }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [view, setView] = useState<ViewMode>('organograma')

  // Only top-level agents (no parent), sorted by department order
  const departments = Object.keys(DEPT_CONFIG)
    .sort((a, b) => DEPT_CONFIG[a].order - DEPT_CONFIG[b].order)
    .reduce((acc, dept) => {
      const deptAgents = agents.filter((a) => a.department === dept && !a.parent_agent_id)
      if (deptAgents.length > 0) acc[dept] = deptAgents
      return acc
    }, {} as Record<string, Agent[]>)

  // Also include agents from departments not in config (e.g. geral)
  const knownDepts = new Set(Object.keys(DEPT_CONFIG))
  agents
    .filter((a) => !knownDepts.has(a.department) && !a.parent_agent_id)
    .forEach((a) => {
      if (!departments[a.department]) departments[a.department] = []
      departments[a.department].push(a)
    })

  function getSubAgents(agentId: string) {
    return agents.filter((a) => a.parent_agent_id === agentId)
  }

  function getAgentSkills(agentId: string) {
    const ids = agentSkills.filter((r) => r.agent_id === agentId).map((r) => r.skill_id)
    return skills.filter((s) => ids.includes(s.id))
  }

  function getAgentMcps(agentId: string) {
    const ids = agentMcps.filter((r) => r.agent_id === agentId).map((r) => r.mcp_id)
    return mcps.filter((m) => ids.includes(m.id))
  }

  function getAgentAutomations(agentId: string) {
    return automations.filter((a) => a.agent_id === agentId)
  }

  function renderAgent(agent: Agent) {
    const isExpanded = expanded === agent.id
    const linkedSkills = getAgentSkills(agent.id)
    const linkedMcps = getAgentMcps(agent.id)
    const linkedAutomations = getAgentAutomations(agent.id)
    const subAgents = getSubAgents(agent.id)

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
              {subAgents.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-600">
                  {subAgents.length} sub-agente{subAgents.length > 1 ? 's' : ''}
                </span>
              )}
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

            <div className="grid grid-cols-3 gap-4">
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
              <div>
                <p className="text-xs font-semibold text-ink mb-2">Automações vinculadas</p>
                {linkedAutomations.length === 0 ? (
                  <p className="text-xs text-muted">Nenhuma</p>
                ) : (
                  <div className="space-y-2">
                    {linkedAutomations.map((a) => {
                      const sc = STATUS_COLORS[a.status] ?? STATUS_COLORS.unknown
                      const schedule = formatCron(a.trigger_config as Record<string, unknown>)
                      return (
                        <div key={a.id} className="text-xs">
                          <div className="flex items-center gap-1.5">
                            <span>{a.icon}</span>
                            <span className="font-medium">{a.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 ml-5">
                            <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                            <span className="text-muted">{STATUS_LABELS[a.status] ?? a.status}</span>
                            {schedule && (
                              <span className="text-muted">· {schedule}</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {subAgents.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-ink mb-2">Sub-agentes</p>
                <div className="space-y-2">
                  {subAgents.map((sub) => {
                    const sc = STATUS_COLORS[sub.status] ?? STATUS_COLORS.unknown
                    return (
                      <div key={sub.id} className="flex items-start gap-3 p-3 bg-white border border-border rounded-lg">
                        <div className="h-8 w-8 rounded-md bg-violet-50 flex items-center justify-center text-base shrink-0">
                          {sub.icon || '🔧'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-ink">{sub.name}</p>
                            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                              <span className={`h-1 w-1 rounded-full ${sc.dot}`} />
                              {STATUS_LABELS[sub.status] ?? sub.status}
                            </span>
                          </div>
                          {sub.description && (
                            <p className="text-[11px] text-muted mt-1 leading-relaxed">{sub.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {sub.tags.map((tag) => (
                              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-muted">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        <button
          onClick={() => setView('organograma')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            view === 'organograma'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          Organograma
        </button>
        <button
          onClick={() => setView('lista')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            view === 'lista'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          Lista
        </button>
      </div>

      {/* Content */}
      {view === 'organograma' ? (
        <Organograma agents={agents} />
      ) : (
        <div className="max-w-5xl mx-auto space-y-8">
          {Object.entries(departments).map(([dept, deptAgents]) => {
            // For juridico, group by nucleus
            if (dept === 'juridico') {
              const nuclei = Object.keys(NUCLEUS_CONFIG)
                .sort((a, b) => NUCLEUS_CONFIG[a].order - NUCLEUS_CONFIG[b].order)
              return (
                <section key={dept}>
                  <div className="flex items-center gap-2 mb-4">
                    <DeptBadge dept={dept} />
                    <h2 className="text-sm font-semibold text-ink">Departamento Jurídico</h2>
                    <span className="text-xs text-muted">({deptAgents.length} agentes)</span>
                  </div>
                  <div className="space-y-6 pl-4 border-l-2 border-indigo-100">
                    {nuclei.map((nuc) => {
                      const nucAgents = deptAgents.filter((a) => a.nucleus === nuc)
                      const nucCfg = NUCLEUS_CONFIG[nuc]
                      return (
                        <div key={nuc}>
                          <div className="flex items-center gap-2 mb-3">
                            <NucleusBadge nucleus={nuc} />
                            <span className="text-xs text-muted">
                              {nucAgents.length === 0
                                ? '(sem agentes ainda)'
                                : `(${nucAgents.length} agente${nucAgents.length > 1 ? 's' : ''})`}
                            </span>
                          </div>
                          {nucAgents.length > 0 ? (
                            <div className="space-y-2">
                              {nucAgents.map(renderAgent)}
                            </div>
                          ) : (
                            <div className={`rounded-lg border border-dashed border-border p-6 text-center ${nucCfg.colors.split(' ')[0]}`}>
                              <p className="text-2xl mb-2">{nucCfg.icon}</p>
                              <p className="text-sm font-medium text-muted">{nucCfg.label}</p>
                              <p className="text-xs text-muted mt-1">Nenhum agente cadastrado neste núcleo</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            }

            return (
              <section key={dept}>
                <div className="flex items-center gap-2 mb-3">
                  <DeptBadge dept={dept} />
                  <h2 className="text-sm font-semibold text-ink">
                    {DEPT_CONFIG[dept]?.label ? `Departamento ${DEPT_CONFIG[dept].label}` : dept}
                  </h2>
                  <span className="text-xs text-muted">({deptAgents.length} agentes)</span>
                </div>
                <div className="space-y-2">
                  {deptAgents.map(renderAgent)}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
