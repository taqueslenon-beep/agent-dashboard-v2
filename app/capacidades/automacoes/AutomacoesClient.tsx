'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Automation } from '@/lib/types'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/types'

interface Props {
  automations: Automation[]
}

export default function AutomacoesClient({ automations: initial }: Props) {
  const [automations, setAutomations] = useState(initial)

  async function toggleActive(id: string, current: boolean) {
    const { error } = await supabase.from('automations').update({ is_active: !current }).eq('id', id)
    if (!error) {
      setAutomations((prev) => prev.map((a) => (a.id === id ? { ...a, is_active: !current } : a)))
    }
  }

  const triggerLabels: Record<string, string> = {
    cron: 'Cron',
    event: 'Evento',
    hook: 'Hook',
    manual: 'Manual',
  }

  return (
    <div className="space-y-2">
      {automations.map((auto) => {
        const c = STATUS_COLORS[auto.status] ?? STATUS_COLORS.unknown
        return (
          <div key={auto.id} className="bg-white rounded-lg border border-border p-4 flex items-center gap-4">
            <span className="text-2xl">{auto.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-ink">{auto.name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                  {STATUS_LABELS[auto.status]}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  {triggerLabels[auto.trigger_type] ?? auto.trigger_type}
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">{auto.description}</p>
              <div className="flex gap-1.5 mt-2">
                {auto.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-muted">{tag}</span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              {auto.last_run && (
                <p className="text-xs text-muted">
                  Último: {new Date(auto.last_run).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
            <button
              onClick={() => toggleActive(auto.id, auto.is_active)}
              className={`relative w-10 h-5 rounded-full transition-colors ${auto.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${auto.is_active ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
