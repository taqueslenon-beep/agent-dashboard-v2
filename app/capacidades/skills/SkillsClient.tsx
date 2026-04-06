'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Skill } from '@/lib/types'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/types'

interface Props {
  skills: Skill[]
}

export default function SkillsClient({ skills: initial }: Props) {
  const [skills, setSkills] = useState(initial)

  async function toggleActive(id: string, current: boolean) {
    const { error } = await supabase.from('skills').update({ is_active: !current }).eq('id', id)
    if (!error) {
      setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, is_active: !current } : s)))
    }
  }

  return (
    <div className="space-y-2">
      {skills.map((skill) => {
        const c = STATUS_COLORS[skill.status] ?? STATUS_COLORS.unknown
        return (
          <div key={skill.id} className="bg-white rounded-lg border border-border p-4 flex items-center gap-4">
            <span className="text-2xl">{skill.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-ink">{skill.name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                  {STATUS_LABELS[skill.status]}
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">{skill.description}</p>
              <div className="flex gap-1.5 mt-2">
                {skill.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-muted">{tag}</span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0 space-y-1">
              <p className="text-xs text-muted">{skill.passos} passos</p>
              {skill.tem_codigo && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-600">Código</span>}
            </div>
            <button
              onClick={() => toggleActive(skill.id, skill.is_active)}
              className={`relative w-10 h-5 rounded-full transition-colors ${skill.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${skill.is_active ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
