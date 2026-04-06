import { supabase } from '@/lib/supabase'
import SkillsClient from './SkillsClient'

export const dynamic = 'force-dynamic'

export default async function SkillsPage() {
  const { data } = await supabase.from('skills').select('*').order('name')
  return <SkillsClient skills={data ?? []} />
}
