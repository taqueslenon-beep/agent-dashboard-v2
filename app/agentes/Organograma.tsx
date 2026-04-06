'use client'

import { useRef, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Agent } from '@/lib/types'

interface Props {
  agents: Agent[]
}

const DEPT_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  'gabinete-ceo': { fill: '#f5f3ff', stroke: '#7c3aed', text: '#6d28d9' },
  juridico: { fill: '#eef2ff', stroke: '#6366f1', text: '#4338ca' },
  tecnico: { fill: '#f0fdfa', stroke: '#14b8a6', text: '#0f766e' },
  administrativo: { fill: '#fffbeb', stroke: '#f59e0b', text: '#b45309' },
  comercial: { fill: '#fff1f2', stroke: '#f43f5e', text: '#be123c' },
  inteligencia: { fill: '#fefce8', stroke: '#eab308', text: '#a16207' },
}

const DEPT_LABELS: Record<string, string> = {
  'gabinete-ceo': 'Gabinete do CEO',
  juridico: 'Dept. Jurídico',
  tecnico: 'Dept. Técnico',
  administrativo: 'Dept. Administrativo',
  comercial: 'Dept. Comercial',
  inteligencia: 'Dept. Inteligência',
}

const STATUS_FILLS: Record<string, string> = {
  active: '#dcfce7',
  prototype: '#fef3c7',
  planned: '#f1f5f9',
  idle: '#f1f5f9',
  error: '#fecaca',
}
const STATUS_STROKES: Record<string, string> = {
  active: '#22c55e',
  prototype: '#f59e0b',
  planned: '#94a3b8',
  idle: '#94a3b8',
  error: '#ef4444',
}
const STATUS_LABEL: Record<string, string> = {
  active: 'Ativo',
  prototype: 'Protótipo',
  planned: 'Planejado',
  idle: 'Ocioso',
  error: 'Erro',
}

const NW = 200, NH = 58
const SUB_W = 130, SUB_H = 40
const CEO_W = 250, CEO_H = 70

export default function Organograma({ agents }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.75 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [filter, setFilter] = useState<string>('all')

  // Group agents by department
  const topAgents = agents.filter(a => !a.parent_agent_id)
  const deptOrder = ['gabinete-ceo', 'juridico', 'tecnico', 'administrativo', 'comercial', 'inteligencia']
  const departments = deptOrder.reduce((acc, dept) => {
    const deptAgents = topAgents.filter(a => a.department === dept).sort((a, b) => a.level - b.level)
    if (deptAgents.length > 0) acc[dept] = deptAgents
    return acc
  }, {} as Record<string, Agent[]>)

  // Also include unknown departments
  topAgents.forEach(a => {
    if (!deptOrder.includes(a.department)) {
      if (!departments[a.department]) departments[a.department] = []
      if (!departments[a.department].find(x => x.id === a.id)) departments[a.department].push(a)
    }
  })

  const getSubAgents = (agentId: string) => agents.filter(a => a.parent_agent_id === agentId)

  // Layout calculations
  const nonCeoDepts = Object.keys(departments).filter(d => d !== 'gabinete-ceo')
  const DEPT_GAP = 280
  const totalWidth = nonCeoDepts.length * DEPT_GAP
  const centerX = totalWidth / 2 + 140

  const CEO_Y = 30
  const GAB_AGENT_Y = 130
  const DEPT_Y = 230
  const AGENT_START_Y = 310
  const AGENT_GAP = 85

  // Calculate max agent count for SVG height
  const maxAgents = Math.max(...Object.values(departments).map(a => a.length), 0)
  const maxSubs = Math.max(...agents.filter(a => !a.parent_agent_id).map(a => getSubAgents(a.id).length), 0)
  const svgW = totalWidth + 400
  const svgH = AGENT_START_Y + (maxAgents + 1) * AGENT_GAP + maxSubs * (SUB_H + 10) + 250

  // Pan & zoom handlers
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.2, Math.min(2, prev.scale * (e.deltaY > 0 ? 0.93 : 1.07)))
    }))
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true)
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y })
  }, [transform.x, transform.y])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return
    setTransform(prev => ({ ...prev, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }))
  }, [dragging, dragStart])

  const onMouseUp = useCallback(() => setDragging(false), [])

  const fitView = () => setTransform({ x: 50, y: 10, scale: 0.55 })
  const resetView = () => setTransform({ x: 0, y: 0, scale: 0.75 })

  // Center on mount
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setTransform({
        x: (rect.width - svgW * 0.65) / 2,
        y: 20,
        scale: 0.65
      })
    }
  }, [svgW])

  function opacity(status: string) {
    if (filter === 'all') return 1
    return status === filter ? 1 : 0.1
  }

  // Build SVG elements
  const elements: ReactNode[] = []
  let keyIdx = 0

  // CEO node
  const ceoX = centerX - CEO_W / 2
  elements.push(
    <g key={keyIdx++}>
      <rect x={ceoX} y={CEO_Y} width={CEO_W} height={CEO_H} rx={10}
        fill="#f5f3ff" stroke="#7c3aed" strokeWidth={2} />
      <text x={centerX} y={CEO_Y + 22} textAnchor="middle" fontSize={12} fontWeight={800} fill="#6d28d9">
        👔 GABINETE DO CEO
      </text>
      <text x={centerX} y={CEO_Y + 38} textAnchor="middle" fontSize={10} fill="#64748b">
        Lenon Taques — CEO
      </text>
      <text x={centerX} y={CEO_Y + 54} textAnchor="middle" fontSize={8} fill="#94a3b8">
        Orquestrador Principal via Claude Code
      </text>
    </g>
  )

  // Gabinete CEO agents (directly below CEO)
  const gabAgents = departments['gabinete-ceo'] || []
  const gabGap = 24
  const gabTotalW = gabAgents.length * NW + (gabAgents.length - 1) * gabGap
  const gabStartX = centerX - gabTotalW / 2

  gabAgents.forEach((ag, ai) => {
    const ax = gabStartX + ai * (NW + gabGap)
    const acx = ax + NW / 2
    const op = opacity(ag.status)
    const sf = STATUS_FILLS[ag.status] || STATUS_FILLS.planned
    const ss = STATUS_STROKES[ag.status] || STATUS_STROKES.planned

    elements.push(
      <g key={keyIdx++} opacity={op}>
        <line x1={centerX} y1={CEO_Y + CEO_H} x2={acx} y2={GAB_AGENT_Y}
          stroke="#7c3aed" strokeWidth={1.5} markerEnd="url(#arrow-violet)" />
        <rect x={ax} y={GAB_AGENT_Y} width={NW} height={NH} rx={8}
          fill={sf} stroke="#7c3aed" strokeWidth={1.5} />
        <text x={ax + 10} y={GAB_AGENT_Y + 16} fontSize={13}>{ag.icon || '🤖'}</text>
        <text x={ax + 30} y={GAB_AGENT_Y + 16} fontSize={9} fontWeight={700} fill="#6d28d9">
          {ag.name.length > 22 ? ag.name.substring(0, 22) + '..' : ag.name}
        </text>
        <text x={ax + 10} y={GAB_AGENT_Y + 32} fontSize={8} fill="#64748b">
          {ag.role || ''}
        </text>
        <text x={ax + 10} y={GAB_AGENT_Y + 46} fontSize={7} fill="#94a3b8">
          Nível {ag.level} · {STATUS_LABEL[ag.status] || ag.status}
        </text>
        <circle cx={ax + NW - 14} cy={GAB_AGENT_Y + 12} r={3.5} fill={ss} />
      </g>
    )
  })

  // Non-CEO departments
  nonCeoDepts.forEach((dept, di) => {
    const dx = 140 + di * DEPT_GAP
    const dcx = dx + 110
    const dc = DEPT_COLORS[dept] || DEPT_COLORS.geral
    const deptAgents = departments[dept] || []

    // Connection from CEO to department
    elements.push(
      <g key={keyIdx++}>
        <path d={`M${centerX},${CEO_Y + CEO_H} L${centerX},${DEPT_Y - 30} L${dcx},${DEPT_Y - 30} L${dcx},${DEPT_Y}`}
          fill="none" stroke="#cbd5e1" strokeWidth={1.5} markerEnd="url(#arrow)" />
      </g>
    )

    // Department box
    const dw = 220
    elements.push(
      <g key={keyIdx++}>
        <rect x={dcx - dw / 2} y={DEPT_Y} width={dw} height={50} rx={8}
          fill={dc.fill} stroke={dc.stroke} strokeWidth={1.5} />
        <text x={dcx} y={DEPT_Y + 20} textAnchor="middle" fontSize={10} fontWeight={700} fill={dc.text}>
          {DEPT_LABELS[dept] || dept}
        </text>
        <text x={dcx} y={DEPT_Y + 36} textAnchor="middle" fontSize={8} fill="#94a3b8">
          {deptAgents.length} agente{deptAgents.length !== 1 ? 's' : ''}
        </text>
      </g>
    )

    // Agent nodes — cumulative Y to accommodate sub-blocks below each agent
    let currentAgentY = AGENT_START_Y
    let prevAgentBottomY = DEPT_Y + 50

    deptAgents.forEach((ag) => {
      const ax = dcx - NW / 2
      const ay = currentAgentY
      const acx2 = dcx
      const op = opacity(ag.status)
      const sf = STATUS_FILLS[ag.status] || STATUS_FILLS.planned
      const dc2 = DEPT_COLORS[dept] || DEPT_COLORS.geral
      const ss = STATUS_STROKES[ag.status] || STATUS_STROKES.planned
      const subs = getSubAgents(ag.id)

      // Connection from dept/prev element
      elements.push(
        <line key={keyIdx++} x1={dcx} y1={prevAgentBottomY} x2={acx2} y2={ay}
          stroke="#cbd5e1" strokeWidth={1.5} markerEnd="url(#arrow)" opacity={op} />
      )

      // Agent box
      elements.push(
        <g key={keyIdx++} opacity={op}>
          <rect x={ax} y={ay} width={NW} height={NH} rx={7}
            fill={sf} stroke={dc2.stroke} strokeWidth={1} />
          <text x={ax + 10} y={ay + 16} fontSize={13}>{ag.icon || '🤖'}</text>
          <text x={ax + 30} y={ay + 16} fontSize={8.5} fontWeight={600} fill={dc2.text}>
            {ag.name.length > 24 ? ag.name.substring(0, 24) + '..' : ag.name}
          </text>
          <text x={ax + 10} y={ay + 32} fontSize={7.5} fill="#64748b">
            {ag.role || ''}
          </text>
          <circle cx={ax + NW - 14} cy={ay + 12} r={3.5} fill={ss} />
          <text x={ax + 10} y={ay + 46} fontSize={7} fill="#94a3b8">
            L{ag.level} · {STATUS_LABEL[ag.status] || ag.status}{subs.length > 0 ? ` · ${subs.length} sub-agente${subs.length > 1 ? 's' : ''}` : ''}
          </text>
        </g>
      )

      // Sub-agents — 2-column grid below parent (avoids horizontal overflow)
      if (subs.length > 0) {
        const subCols = subs.length === 1 ? 1 : 2
        const subGapX = 8, subGapY = 8, subTopGap = 12
        const subTotalW = subCols * SUB_W + (subCols - 1) * subGapX
        const subStartX = dcx - subTotalW / 2
        const subStartY = ay + NH + subTopGap
        const numSubRows = Math.ceil(subs.length / subCols)
        const subBlockH = numSubRows * SUB_H + (numSubRows - 1) * subGapY

        subs.forEach((sub, si) => {
          const col = si % subCols
          const row = Math.floor(si / subCols)
          const sx = subStartX + col * (SUB_W + subGapX)
          const sy = subStartY + row * (SUB_H + subGapY)
          const sCx = sx + SUB_W / 2
          const sop = opacity(sub.status)
          const ssf = STATUS_FILLS[sub.status] || STATUS_FILLS.planned
          const sss = STATUS_STROKES[sub.status] || STATUS_STROKES.planned

          elements.push(
            <g key={keyIdx++} opacity={sop}>
              <line x1={dcx} y1={ay + NH} x2={sCx} y2={sy}
                stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4,3" markerEnd="url(#arrow)" />
              <rect x={sx} y={sy} width={SUB_W} height={SUB_H} rx={5}
                fill={ssf} stroke="#cbd5e1" strokeWidth={1} />
              <text x={sx + 8} y={sy + 15} fontSize={10}>{sub.icon || '🔧'}</text>
              <text x={sx + 24} y={sy + 15} fontSize={7.5} fontWeight={600} fill="#334155">
                {sub.name.length > 18 ? sub.name.substring(0, 18) + '..' : sub.name}
              </text>
              <circle cx={sx + SUB_W - 12} cy={sy + 10} r={3} fill={sss} />
              <text x={sx + 8} y={sy + 30} fontSize={6.5} fill="#94a3b8">
                {STATUS_LABEL[sub.status] || sub.status}
              </text>
            </g>
          )
        })

        // Next agent connects from bottom of sub-block
        prevAgentBottomY = ay + NH + subTopGap + subBlockH + 16
        currentAgentY = prevAgentBottomY + 14
      } else {
        prevAgentBottomY = ay + NH
        currentAgentY += AGENT_GAP
      }
    })
  })

  const totalAgents = agents.length
  const topCount = topAgents.length
  const subCount = totalAgents - topCount
  const deptCount = Object.keys(departments).length

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted uppercase tracking-wide font-medium">Filtrar:</span>
          {['all', 'active', 'prototype', 'planned'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${
                filter === f
                  ? 'bg-primary/10 border-primary/30 text-primary font-medium'
                  : 'bg-white border-border text-muted hover:bg-surface/80'
              }`}>
              {f === 'all' ? 'Todos' : f === 'active' ? '● Ativos' : f === 'prototype' ? '● Protótipos' : '● Planejados'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={resetView} className="text-[11px] px-2.5 py-1 rounded border border-border text-muted hover:bg-surface/80">
            ↺ Reset
          </button>
          <button onClick={fitView} className="text-[11px] px-2.5 py-1 rounded border border-border text-muted hover:bg-surface/80">
            ⊡ Fit
          </button>
          <span className="text-[10px] text-muted">Zoom: {Math.round(transform.scale * 100)}%</span>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef}
        className="relative w-full bg-surface/30 border border-border rounded-lg overflow-hidden"
        style={{ height: 'calc(100vh - 220px)', cursor: dragging ? 'grabbing' : 'grab' }}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
          position: 'absolute',
          width: svgW,
          height: svgH,
        }}>
          <svg width={svgW} height={svgH} xmlns="http://www.w3.org/2000/svg"
            style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
            <defs>
              <marker id="arrow" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="6" markerHeight="4" orient="auto">
                <polygon points="0 0,10 3.5,0 7" fill="#cbd5e1" />
              </marker>
              <marker id="arrow-violet" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="6" markerHeight="4" orient="auto">
                <polygon points="0 0,10 3.5,0 7" fill="#7c3aed" />
              </marker>
            </defs>
            {elements}
          </svg>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-3 text-[10px] text-muted">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span>Organograma Taques Agents</span>
        <span className="text-border">|</span>
        <span>{deptCount} departamentos · {topCount} agentes · {subCount} sub-agentes</span>
      </div>
    </div>
  )
}
