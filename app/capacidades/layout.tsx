'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const subtabs = [
  { href: '/capacidades/skills', label: 'Skills' },
  { href: '/capacidades/automacoes', label: 'Automações' },
  { href: '/capacidades/mcps', label: 'MCPs' },
]

export default function CapacidadesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex gap-2">
        {subtabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-cream'
                  : 'bg-white text-muted border border-border hover:text-ink'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
      {children}
    </div>
  )
}
