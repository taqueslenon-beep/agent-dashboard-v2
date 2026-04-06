'use client'

interface MetricCardProps {
  label: string
  value: number
  icon: string
  color: string
}

export default function MetricCard({ label, value, icon, color }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg border border-border p-5 flex items-center gap-4">
      <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-ink">{value}</p>
        <p className="text-sm text-muted">{label}</p>
      </div>
    </div>
  )
}
