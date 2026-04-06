'use client'

import { useState } from 'react'
import type { Flow, FlowNode, FlowEdge } from '@/lib/types'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/types'
import FlowExecutionModal from './FlowExecutionModal'

interface Props {
  flows: Flow[]
}

const NODE_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  start: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', icon: '▶' },
  end: { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-600', icon: '⏹' },
  agent: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', icon: '🤖' },
  human: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', icon: '👤' },
  tool: { bg: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-700', icon: '🔧' },
  conditional: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', icon: '◇' },
}

function FlowNodeCard({ node }: { node: FlowNode }) {
  const style = NODE_STYLES[node.type] ?? NODE_STYLES.tool
  return (
    <div className={`rounded-lg border-2 ${style.border} ${style.bg} px-4 py-3 min-w-[180px] max-w-[220px]`}>
      <div className="flex items-center gap-2">
        <span className="text-sm">{style.icon}</span>
        <p className={`text-xs font-semibold ${style.text}`}>{node.label}</p>
      </div>
      {node.description && (
        <p className="text-[10px] text-muted mt-1 leading-relaxed">{node.description}</p>
      )}
      <span className={`inline-block mt-1.5 text-[9px] px-1.5 py-0.5 rounded ${style.bg} ${style.text} opacity-70 uppercase tracking-wide font-medium`}>
        {node.type}
      </span>
    </div>
  )
}

function Arrow({ label, condition }: { label?: string; condition?: string }) {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="w-px h-5 bg-border" />
      <svg className="w-3 h-3 text-muted -mt-0.5" fill="currentColor" viewBox="0 0 12 12">
        <path d="M6 9L1 4h10z" />
      </svg>
      {(label || condition) && (
        <span className={`text-[9px] mt-0.5 px-1.5 py-0.5 rounded ${condition === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-surface text-muted'}`}>
          {label || condition}
        </span>
      )}
    </div>
  )
}

function FlowDiagram({ flow }: { flow: Flow }) {
  const { nodes, edges } = flow.graph

  // Build stages from the graph structure
  const stages = buildStages(nodes, edges)

  return (
    <div className="flex flex-col items-center py-4">
      {stages.map((stage, i) => (
        <div key={i}>
          {i > 0 && <Arrow {...getEdgeProps(stages, edges, i)} />}
          <div className="flex items-start gap-4 justify-center">
            {stage.map((node) => (
              <FlowNodeCard key={node.id} node={node} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function buildStages(nodes: FlowNode[], edges: FlowEdge[]): FlowNode[][] {
  // Simple topological layering
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const inDegree = new Map<string, number>()
  const children = new Map<string, string[]>()

  nodes.forEach((n) => {
    inDegree.set(n.id, 0)
    children.set(n.id, [])
  })

  edges.forEach((e) => {
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1)
    children.get(e.source)?.push(e.target)
  })

  const stages: FlowNode[][] = []
  const visited = new Set<string>()
  let current = nodes.filter((n) => (inDegree.get(n.id) ?? 0) === 0).map((n) => n.id)

  while (current.length > 0) {
    const stageNodes = current.map((id) => nodeMap.get(id)!).filter(Boolean)
    if (stageNodes.length > 0) stages.push(stageNodes)
    current.forEach((id) => visited.add(id))

    const next = new Set<string>()
    current.forEach((id) => {
      children.get(id)?.forEach((child) => {
        if (!visited.has(child)) {
          // Check if all parents are visited
          const parentEdges = edges.filter((e) => e.target === child)
          if (parentEdges.every((e) => visited.has(e.source))) {
            next.add(child)
          }
        }
      })
    })
    current = Array.from(next)
  }

  return stages
}

function getEdgeProps(stages: FlowNode[][], edges: FlowEdge[], stageIdx: number): { label?: string; condition?: string } {
  if (stageIdx === 0) return {}
  const prevIds = stages[stageIdx - 1].map((n) => n.id)
  const currIds = stages[stageIdx].map((n) => n.id)
  const edge = edges.find((e) => prevIds.includes(e.source) && currIds.includes(e.target))
  return { label: edge?.label, condition: edge?.condition }
}

export default function FluxosClient({ flows }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [executingFlow, setExecutingFlow] = useState<Flow | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  if (flows.length === 0) {
    return <p className="text-sm text-muted py-8 text-center">Nenhum fluxo cadastrado.</p>
  }

  return (
    <div className="space-y-2">
      {flows.map((flow) => {
        const isExpanded = expanded === flow.id
        const c = STATUS_COLORS[flow.status] ?? STATUS_COLORS.unknown
        const nodeCount = flow.graph?.nodes?.length ?? 0
        const hasHitl = flow.graph?.nodes?.some((n: FlowNode) => n.type === 'human') ?? false

        return (
          <div key={flow.id} className="bg-white rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setExpanded(isExpanded ? null : flow.id)}
              className="w-full px-5 py-4 flex items-center gap-4 hover:bg-surface/50 transition-colors text-left"
            >
              <span className="text-2xl">{flow.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-ink">{flow.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                    {STATUS_LABELS[flow.status] ?? flow.status}
                  </span>
                  {hasHitl && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600">
                      HITL
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted mt-0.5">{flow.description}</p>
                <div className="flex gap-1.5 mt-2">
                  {flow.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-muted">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0 space-y-1">
                <p className="text-xs text-muted">{nodeCount} nós</p>
                <p className="text-[10px] text-muted">{flow.graph?.edges?.length ?? 0} conexões</p>
              </div>
              <svg className={`w-4 h-4 text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isExpanded && (
              <div className="border-t border-border">
                {/* Flow diagram */}
                <div className="px-5 py-4 bg-surface/30 overflow-x-auto">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-ink">Diagrama do Fluxo (LangGraph)</p>
                    <button
                      onClick={() => setExecutingFlow(flow)}
                      disabled={flow.status !== 'active'}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        flow.status === 'active'
                          ? 'bg-primary text-cream hover:bg-primary/90'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {flow.status === 'active' ? '▶ Iniciar Fluxo' : '▶ Iniciar (planejado)'}
                    </button>
                  </div>
                  <FlowDiagram flow={flow} />
                </div>

                {/* Legend */}
                <div className="px-5 py-3 border-t border-border">
                  <p className="text-[10px] font-semibold text-muted mb-2 uppercase tracking-wide">Legenda</p>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(NODE_STYLES).map(([type, style]) => (
                      <div key={type} className="flex items-center gap-1.5">
                        <span className={`inline-block w-3 h-3 rounded border ${style.border} ${style.bg}`} />
                        <span className="text-[10px] text-muted capitalize">{
                          type === 'human' ? 'Humano (HITL)' :
                          type === 'agent' ? 'Agente' :
                          type === 'tool' ? 'Ferramenta' :
                          type === 'start' ? 'Início' :
                          type === 'end' ? 'Fim' :
                          type === 'conditional' ? 'Condicional' : type
                        }</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Modal de execução */}
      {executingFlow && (
        <FlowExecutionModal
          flow={executingFlow}
          isOpen={true}
          onClose={() => setExecutingFlow(null)}
          onSuccess={() => setRefreshTrigger(prev => prev + 1)}
        />
      )}
    </div>
  )
}
