'use client'

import type { McpServer } from '@/lib/types'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/types'

interface Props {
  mcps: McpServer[]
}

export default function McpsClient({ mcps }: Props) {
  return (
    <div className="space-y-2">
      {mcps.map((mcp) => {
        const c = STATUS_COLORS[mcp.status] ?? STATUS_COLORS.unknown
        return (
          <div key={mcp.id} className="bg-white rounded-lg border border-border p-4">
            <div className="flex items-center gap-4">
              <div className={`h-3 w-3 rounded-full ${c.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-ink">{mcp.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                    {STATUS_LABELS[mcp.status]}
                  </span>
                </div>
                {mcp.url && <p className="text-xs text-muted font-mono mt-0.5">{mcp.url}</p>}
              </div>
              <span className="text-xs text-muted">{mcp.tools_available.length} ferramentas</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3 pl-7">
              {mcp.tools_available.map((tool) => (
                <span key={tool} className="text-[10px] px-2 py-0.5 rounded bg-surface font-mono text-muted">{tool}</span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
