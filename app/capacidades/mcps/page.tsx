import { supabase } from '@/lib/supabase'
import McpsClient from './McpsClient'

export const dynamic = 'force-dynamic'

export default async function McpsPage() {
  const { data } = await supabase.from('mcp_servers').select('*').order('name')
  return <McpsClient mcps={data ?? []} />
}
