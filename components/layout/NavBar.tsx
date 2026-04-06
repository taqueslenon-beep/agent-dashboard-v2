'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/tarefas', label: 'Tarefas' },
  { href: '/agentes', label: 'Agentes' },
  { href: '/capacidades', label: 'Capacidades' },
  { href: '/timeline', label: 'Linha do Tempo' },
]

export default function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-border px-6">
      <div className="flex gap-0">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-ink hover:border-beige'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
