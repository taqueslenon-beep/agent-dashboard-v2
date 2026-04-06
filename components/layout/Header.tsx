'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Header() {
  const [agentsActive, setAgentsActive] = useState(0)
  const [tasksPending, setTasksPending] = useState(0)

  useEffect(() => {
    async function load() {
      const [agents, tasks] = await Promise.all([
        supabase.from('agents').select('id', { count: 'exact' }).in('status', ['active', 'prototype']),
        supabase.from('tasks').select('id', { count: 'exact' }).in('status', ['awaiting_approval', 'error']),
      ])
      setAgentsActive(agents.count ?? 0)
      setTasksPending(tasks.count ?? 0)
    }
    load()
  }, [])

  return (
    <header className="bg-primary text-cream px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">TA</span>
          <div className="h-6 w-px bg-cream/30" />
          <span className="text-sm font-medium tracking-wide">TAQUES AGENTS</span>
        </div>
        <span className="text-[10px] font-mono bg-accent/30 text-cream/80 px-2 py-0.5 rounded">
          AG-UI PROTOCOL V0.1
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-cream/70">{agentsActive} agentes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-orange-400" />
          <span className="text-cream/70">{tasksPending} pendentes</span>
        </div>
      </div>
    </header>
  )
}
