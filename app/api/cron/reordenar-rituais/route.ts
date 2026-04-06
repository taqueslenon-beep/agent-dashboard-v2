import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const TODOIST_API = 'https://api.todoist.com/api/v1'
const TODOIST_TOKEN = process.env.TODOIST_API_KEY!

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const MATINAL_ORDER = [
  { id: '6gH2wg8gVXvjPvFm', order: 1, label: 'Medicamentos' },
  { id: '6gH2wgM42CH68X2F', order: 2, label: 'Oração' },
  { id: '6gG56g9M8QV9RWwm', order: 3, label: 'Agenda' },
  { id: '6gG56gJ63jfmF9jF', order: 4, label: 'Todoist' },
  { id: '6gG56MQJ52FvJXxm', order: 5, label: 'Trello' },
  { id: '6gG56MHhVHgFGJ8F', order: 6, label: 'Slack' },
  { id: '6gG56MCv2W44qgrF', order: 7, label: 'WhatsApp' },
  { id: '6gG56PJMCgM4jPqF', order: 8, label: 'E-mail' },
  { id: '6gG56PxfW7QPMwPm', order: 9, label: 'Instagram' },
]

const NOTURNO_ORDER = [
  { id: '6gGjjWg99W48G842', order: 1, label: 'WhatsApp' },
  { id: '6gGjjX4Q6Vx74pR2', order: 2, label: 'Slack' },
  { id: '6gGjjWxmG644c5h2', order: 3, label: 'Instagram' },
  { id: '6gGjjXpgx3r99mfR', order: 4, label: 'Agenda' },
  { id: '6gGjjg3Fc8gV6xXR', order: 5, label: 'Todoist' },
  { id: '6gGjjX7VjvWQm5w2', order: 6, label: 'Trello' },
  { id: '6gGgPc2MQWJX99XR', order: 7, label: 'Roupa' },
  { id: '6gGgPcCgxFC5VRVR', order: 8, label: 'Medicamentos' },
  { id: '6gGjjXVr2XPrfWPR', order: 9, label: 'Despertador' },
]

async function reorderSubtask(taskId: string, order: number): Promise<boolean> {
  const res = await fetch(`${TODOIST_API}/tasks/${taskId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TODOIST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ child_order: order }),
  })
  return res.ok
}

async function logToSupabase(supabase: SupabaseClient, success: number, errors: number) {
  await supabase.from('activity_log').insert({
    agent_id: null,
    action: 'Reordenação de rituais Todoist',
    event_type: 'execution',
    details: {
      automation_id: 'reordenar-rituais-todoist',
      matinal_tasks: MATINAL_ORDER.length,
      noturno_tasks: NOTURNO_ORDER.length,
      success,
      errors,
      timestamp: new Date().toISOString(),
    },
  } as Record<string, unknown>)

  await supabase
    .from('automations')
    .update({ last_run: new Date().toISOString() } as Record<string, unknown>)
    .eq('id', 'reordenar-rituais-todoist')
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  let success = 0
  let errors = 0

  for (const task of [...MATINAL_ORDER, ...NOTURNO_ORDER]) {
    const ok = await reorderSubtask(task.id, task.order)
    if (ok) {
      success++
    } else {
      errors++
    }
  }

  await logToSupabase(supabase, success, errors)

  return NextResponse.json({
    status: 'ok',
    reordered: success,
    errors,
    matinal: MATINAL_ORDER.length,
    noturno: NOTURNO_ORDER.length,
    timestamp: new Date().toISOString(),
  })
}
