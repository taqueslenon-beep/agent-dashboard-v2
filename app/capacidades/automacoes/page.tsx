import { supabase } from '@/lib/supabase'
import AutomacoesClient from './AutomacoesClient'

export const dynamic = 'force-dynamic'

export default async function AutomacoesPage() {
  const { data } = await supabase.from('automations').select('*').order('name')
  return <AutomacoesClient automations={data ?? []} />
}
