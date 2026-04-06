'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Automation } from '@/lib/types'

interface Props {
  automations: Automation[]
}

function displayStatus(status: string): 'Ativo' | 'Planejado' {
  return status === 'active' ? 'Ativo' : 'Planejado'
}

function statusOrder(status: string): number {
  return status === 'active' ? 0 : 1
}

function formatCron(config: Record<string, unknown>): string {
  const cron = config?.cron as string | undefined
  if (!cron) return '—'

  const parts = cron.split(' ')
  if (parts.length < 5) return cron

  const [min, hour, , , dow] = parts
  const h = hour.padStart(2, '0')
  const m = min.padStart(2, '0')

  const dowMap: Record<string, string> = {
    '*': 'Diariamente',
    '1-5': 'Seg–Sex',
    '0': 'Dom', '1': 'Seg', '2': 'Ter', '3': 'Qua', '4': 'Qui', '5': 'Sex', '6': 'Sáb',
  }

  const freq = dowMap[dow] ?? `Dias: ${dow}`
  return `${freq} às ${h}:${m} UTC`
}

export default function AutomacoesClient({ automations: initial }: Props) {
  const [automations, setAutomations] = useState(initial)

  async function toggleActive(id: string, current: boolean) {
    const { error } = await supabase.from('automations').update({ is_active: !current }).eq('id', id)
    if (!error) {
      setAutomations((prev) => prev.map((a) => (a.id === id ? { ...a, is_active: !current } : a)))
    }
  }

  const sorted = [...automations].sort((a, b) => {
    const sa = statusOrder(a.status)
    const sb = statusOrder(b.status)
    if (sa !== sb) return sa - sb
    return a.name.localeCompare(b.name, 'pt-BR')
  })

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted">
            <th className="pb-3 pl-3 w-10"></th>
            <th className="pb-3 px-3">Nome / Descrição</th>
            <th className="pb-3 px-3 w-24 text-center">Status</th>
            <th className="pb-3 px-3 w-40">Frequência</th>
            <th className="pb-3 px-3 w-44">Tags</th>
            <th className="pb-3 px-3 w-28 text-center">Última exec.</th>
            <th className="pb-3 px-3 w-16 text-center">On/Off</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((auto) => {
            const isActive = auto.status === 'active'
            const statusLabel = displayStatus(auto.status)
            return (
              <tr
                key={auto.id}
                className="border-b border-border/50 hover:bg-surface/50 transition-colors"
              >
                {/* Emoji */}
                <td className="py-3 pl-3 text-xl">{auto.icon}</td>

                {/* Nome + Descrição */}
                <td className="py-3 px-3">
                  <p className="font-semibold text-ink">{auto.name}</p>
                  <p className="text-xs text-muted mt-0.5 line-clamp-2">{auto.description}</p>
                </td>

                {/* Status */}
                <td className="py-3 px-3 text-center">
                  <span
                    className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {statusLabel}
                  </span>
                </td>

                {/* Frequência */}
                <td className="py-3 px-3 text-xs text-muted">
                  {formatCron(auto.trigger_config)}
                </td>

                {/* Tags */}
                <td className="py-3 px-3">
                  <div className="flex flex-wrap gap-1">
                    {auto.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                    {auto.tags.length > 4 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-muted">
                        +{auto.tags.length - 4}
                      </span>
                    )}
                  </div>
                </td>

                {/* Última execução */}
                <td className="py-3 px-3 text-xs text-muted text-center">
                  {auto.last_run
                    ? new Date(auto.last_run).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—'}
                </td>

                {/* Toggle */}
                <td className="py-3 px-3 text-center">
                  <button
                    onClick={() => toggleActive(auto.id, auto.is_active)}
                    className={`relative inline-block w-10 h-5 rounded-full transition-colors ${
                      auto.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                        auto.is_active ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {sorted.length === 0 && (
        <p className="text-center text-muted text-sm py-8">Nenhuma automação cadastrada.</p>
      )}
    </div>
  )
}
