import { supabase } from '@/lib/supabase'
import FluxosClient from './FluxosClient'

export const dynamic = 'force-dynamic'

export default async function FluxosPage() {
  const { data, error } = await supabase.from('flows').select('*').order('name')

  if (error) {
    return (
      <div className="text-center py-16 text-red-400">
        <p className="text-lg font-medium">Erro ao carregar fluxos</p>
        <p className="text-sm mt-2 text-slate-500">{error.message}</p>
      </div>
    )
  }

  return <FluxosClient flows={data ?? []} />
}
