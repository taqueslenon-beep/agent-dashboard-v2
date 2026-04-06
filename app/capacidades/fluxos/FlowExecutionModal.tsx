'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Flow, FlowParameter } from '@/lib/types'

interface Props {
  flow: Flow
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function FlowExecutionModal({ flow, isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState<Record<string, string | number>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parameters = flow.parameters || []

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validate required fields
    const missingFields = parameters
      .filter(p => p.required && !formData[p.id])
      .map(p => p.label)

    if (missingFields.length > 0) {
      setError(`Campos obrigatórios: ${missingFields.join(', ')}`)
      setLoading(false)
      return
    }

    try {
      // Create task from flow execution
      const taskName = `${flow.name} — ${Object.entries(formData)
        .slice(0, 2)
        .map(([, v]) => v)
        .join(', ')}`

      const { error: insertError } = await supabase.from('tasks').insert({
        agent_id: flow.trigger_agent_id,
        name: taskName,
        status: 'pending',
        progress: 0,
        requires_approval: flow.requires_approval,
        error_message: null,
        started_at: new Date().toISOString(),
        completed_at: null,
        // Store parameters as JSON metadata
        metadata: {
          flow_id: flow.id,
          flow_name: flow.name,
          parameters: formData,
        },
      })

      if (insertError) throw insertError

      // Reset form
      setFormData({})
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao executar fluxo')
    } finally {
      setLoading(false)
    }
  }

  function handleInputChange(parameterId: string, value: string | number) {
    setFormData(prev => ({ ...prev, [parameterId]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
            <span>{flow.icon}</span>
            Executar: {flow.name}
          </h2>
          <p className="text-xs text-muted mt-1">{flow.description}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {parameters.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">
              Este fluxo não requer parâmetros adicionais.
            </p>
          ) : (
            <>
              {parameters.map((param) => (
                <div key={param.id}>
                  <label className="text-xs font-semibold text-ink block mb-1.5">
                    {param.label}
                    {param.required && <span className="text-red-600 ml-1">*</span>}
                  </label>

                  {param.type === 'select' ? (
                    <select
                      value={formData[param.id] ?? ''}
                      onChange={(e) => handleInputChange(param.id, e.target.value)}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required={param.required}
                    >
                      <option value="">
                        {param.placeholder || `Selecione ${param.label.toLowerCase()}`}
                      </option>
                      {param.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : param.type === 'textarea' ? (
                    <textarea
                      value={formData[param.id] ?? ''}
                      onChange={(e) => handleInputChange(param.id, e.target.value)}
                      placeholder={param.placeholder}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      rows={4}
                      required={param.required}
                    />
                  ) : (
                    <input
                      type={param.type}
                      value={formData[param.id] ?? ''}
                      onChange={(e) => handleInputChange(param.id, e.target.value)}
                      placeholder={param.placeholder}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required={param.required}
                    />
                  )}

                  {param.description && (
                    <p className="text-[10px] text-muted mt-1">{param.description}</p>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 text-sm px-3 py-2 rounded-lg border border-border text-ink hover:bg-surface/50 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 text-sm px-3 py-2 rounded-lg bg-primary text-cream hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium"
            >
              {loading ? '⏳ Iniciando...' : '▶ Iniciar Fluxo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
