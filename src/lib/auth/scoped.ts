import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireGym } from '@/lib/auth'

/**
 * Returns the Supabase client + the current gym's ID (from session).
 * If no gym session is active, redirects to /login.
 *
 * Usage in Server Components:
 *   const { supabase, gymId } = await getGymScopedClient()
 *   const { data } = await supabase.from('plans').select('*').eq('gym_id', gymId)
 */
export async function getGymScopedClient() {
  const session = await requireGym()
  if (!session) {
    redirect('/login')
  }
  const supabase = await createClient()
  return { supabase, gymId: session.gymId, gymName: session.gymName }
}
