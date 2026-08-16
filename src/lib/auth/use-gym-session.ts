'use client'

import { useEffect, useState } from 'react'

interface GymSession {
  role: 'gym'
  gymId: string
  gymName: string
  email: string
}

/**
 * Client hook that fetches the current gym session.
 * Used in client-side Add/Edit forms to scope inserts by gymId.
 */
export function useGymSession() {
  const [session, setSession] = useState<GymSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.role === 'gym') setSession(data as GymSession)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return { session, loading }
}
