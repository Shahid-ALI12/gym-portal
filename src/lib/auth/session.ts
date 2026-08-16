import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'gym_portal_session'
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'gym-portal-dev-secret-change-in-production-please-32chars'
)

export interface SessionPayload {
  // For gym owners: role = 'gym'
  role: 'gym' | 'admin'
  gymId?: string
  gymName?: string
  ownerEmail?: string
  adminId?: string
  adminEmail?: string
}

export type Session =
  | { role: 'admin'; adminId: string; email: string; name: string }
  | { role: 'gym'; gymId: string; gymName: string; email: string }
  | null

export async function signSession(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

/** Set the session cookie — call from a Server Action or Route Handler */
export async function setSessionCookie(payload: SessionPayload) {
  const token = await signSession(payload)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

/** Clear the session cookie */
export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

/** Get the current session from cookies (Server Components / Server Actions) */
export async function getSession(): Promise<Session> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  return getSessionFromToken(token)
}

/** Read session from raw cookie value (works in middleware edge runtime) */
export async function getSessionFromToken(token: string | undefined): Promise<Session> {
  if (!token) return null
  const payload = await verifySession(token)
  if (!payload) return null

  if (payload.role === 'gym' && payload.gymId) {
    return {
      role: 'gym',
      gymId: payload.gymId,
      gymName: payload.gymName ?? 'Gym',
      email: payload.ownerEmail ?? '',
    }
  }
  if (payload.role === 'admin' && payload.adminId) {
    return {
      role: 'admin',
      adminId: payload.adminId,
      email: payload.adminEmail ?? '',
      name: 'Super Admin',
    }
  }
  return null
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE
