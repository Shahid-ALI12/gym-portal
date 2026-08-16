import bcrypt from 'bcryptjs'
import { createClient } from '@/lib/supabase/server'
import { setSessionCookie, clearSessionCookie, getSession } from './session'

// ----------------------------------------------------------------
// Super Admin
// ----------------------------------------------------------------

/** Create a super admin account (one-time bootstrap). */
export async function createSuperAdmin(email: string, password: string, name: string) {
  const supabase = await createClient()
  const hash = await bcrypt.hash(password, 10)
  const { data, error } = await supabase
    .from('super_admins')
    .insert({ email: email.toLowerCase().trim(), password_hash: hash, name })
    .select('id, email, name')
    .single()
  if (error) throw new Error(error.message)
  return data
}

/** Login super admin → sets cookie */
export async function loginSuperAdmin(email: string, password: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('super_admins')
    .select('id, email, name, password_hash')
    .eq('email', email.toLowerCase().trim())
    .single()
  if (error || !data) return { error: 'Invalid email or password' }
  const ok = await bcrypt.compare(password, data.password_hash)
  if (!ok) return { error: 'Invalid email or password' }

  await setSessionCookie({
    role: 'admin',
    adminId: data.id,
    adminEmail: data.email,
  })
  return { ok: true }
}

// ----------------------------------------------------------------
// Gym Owner
// ----------------------------------------------------------------

/** Used by super admin to create a new gym + owner account */
export async function createGym(input: {
  name: string
  owner_email: string
  owner_password: string
  owner_name?: string
  phone?: string
  address?: string
  subscription_plan?: 'monthly' | 'quarterly' | 'yearly'
  subscription_days?: number // 30 / 90 / 365
}) {
  const supabase = await createClient()
  const hash = await bcrypt.hash(input.owner_password, 10)
  const expires = new Date()
  expires.setDate(expires.getDate() + (input.subscription_days ?? 30))

  const { data: gym, error } = await supabase
    .from('gyms')
    .insert({
      name: input.name.trim(),
      owner_email: input.owner_email.toLowerCase().trim(),
      owner_password_hash: hash,
      owner_name: input.owner_name ?? '',
      phone: input.phone ?? '',
      address: input.address ?? '',
      subscription_status: 'trial',
      subscription_plan: input.subscription_plan ?? 'monthly',
      subscription_expires: expires.toISOString().slice(0, 10),
    })
    .select('id, name')
    .single()
  if (error) return { error: error.message }

  // Auto-create default settings row for this gym
  await supabase.from('settings').insert({
    gym_id: gym.id,
    gym_name: input.name.trim(),
  })

  return { gym }
}

/** Login gym owner → sets cookie */
export async function loginGymOwner(email: string, password: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gyms')
    .select('id, name, owner_email, owner_password_hash, subscription_status, subscription_expires')
    .eq('owner_email', email.toLowerCase().trim())
    .single()
  if (error || !data) return { error: 'Invalid email or password' }
  const ok = await bcrypt.compare(password, data.owner_password_hash)
  if (!ok) return { error: 'Invalid email or password' }

  await setSessionCookie({
    role: 'gym',
    gymId: data.id,
    gymName: data.name,
    ownerEmail: data.owner_email,
  })
  return {
    ok: true,
    subscriptionStatus: data.subscription_status,
    subscriptionExpires: data.subscription_expires,
  }
}

/** Logout any user */
export async function logout() {
  await clearSessionCookie()
}

/** Require admin session — use in admin Server Components */
export async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return null
  }
  return session
}

/** Require gym session — use in gym Server Components */
export async function requireGym() {
  const session = await getSession()
  if (!session || session.role !== 'gym') {
    return null
  }
  return session
}
