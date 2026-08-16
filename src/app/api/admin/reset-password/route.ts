import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'

export async function POST(req: NextRequest) {
  // Only super admin can reset gym owner passwords
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { gym_id, new_password } = await req.json()
  if (!gym_id || typeof new_password !== 'string' || new_password.length < 6) {
    return NextResponse.json({ error: 'Invalid input — password must be at least 6 chars' }, { status: 400 })
  }

  const hash = await bcrypt.hash(new_password, 10)
  const supabase = await createClient()
  const { error } = await supabase
    .from('gyms')
    .update({ owner_password_hash: hash })
    .eq('id', gym_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
