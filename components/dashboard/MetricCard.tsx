'use client'

interface MetricCardProps {
  label: string
  value: number | string
  icon: string
  color: string
  detail?: string
  alert?: string
}

export default function MetricCard({ label, value, icon, color, detail, alert }: MetricCardProps) {
  return (
    <div className={`bg-white rounded-lg border p-5 flex items-center gap-4 ${alert ? 'border-red-400' : 'border-border'}`}>
      <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-xl ${color}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-bold text-ink">{value}</p>
        <p className="text-sm text-muted">{label}</p>
        {detail && <p className="text-xs text-muted mt-0.5">{detail}</p>}
        {alert && <p className="text-xs font-semibold text-red-600 mt-1">⚠ {alert}</p>}
      </div>
    </div>
  )
}
