import { useState, useCallback, useEffect, useRef } from 'react'
import { API_URL } from '../config/x402-config'

export interface WalletSession {
  sessionToken: string
  walletAddress: string
  expiresAt: string
}

export interface Entitlement {
  id: string
  assetId: string
  planType: '24h' | '7d'
  expiresAt: string
  createdAt: string
}

export interface UseWalletSessionResult {
  // State
  session: WalletSession | null
  isAuthenticated: boolean
  isAuthenticating: boolean
  isVerifyingSession: boolean // True when verifying existing session on mount
  entitlements: Entitlement[]
  error: string | null
  
  // Actions
  authenticate: (walletAddress: string) => Promise<boolean>
  logout: () => Promise<void>
  refreshSession: () => Promise<boolean>
  fetchEntitlements: () => Promise<Entitlement[]>
  hasAccessTo: (assetId: string) => boolean
  getSessionHeader: () => Record<string, string>
}

const STORAGE_KEY = 'x402_wallet_session'
const SIGNED_IN_KEY = 'qcumb_signed_in_v1'
const AUTH_COOLDOWN_MS = 10_000
const SESSION_VERIFY_MIN_INTERVAL_MS = 5_000
const ENTITLEMENTS_MIN_INTERVAL_MS = 5_000

let sessionVerifyInFlight = false
let entitlementsInFlight = false
let lastSessionVerifyAt = 0
let lastEntitlementsAt = 0
let sessionCooldownUntil = 0
let entitlementsCooldownUntil = 0

// Load session from localStorage
// Don't check expiration date here - let the server verify it
// The server is the source of truth for session validity
const loadSession = (): WalletSession | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const session = JSON.parse(saved) as WalletSession
      // Return session even if expired locally - server will verify
      // This allows server to potentially extend session validity
        return session
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
  return null
}

const notifySessionChange = () => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event('wallet-session-updated'))
}

// Save session to localStorage
const saveSession = (session: WalletSession | null) => {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
  notifySessionChange()
}

export const useWalletSession = (): UseWalletSessionResult => {
  const [session, setSession] = useState<WalletSession | null>(loadSession)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isVerifyingSession, setIsVerifyingSession] = useState(false)
  const [entitlements, setEntitlements] = useState<Entitlement[]>([])
  const [error, setError] = useState<string | null>(null)
  const authInFlightRef = useRef(false)
  const authCooldownUntilRef = useRef<number | null>(null)

  const isAuthenticated = session !== null

  // Get session header for API requests
  const getSessionHeader = useCallback((): Record<string, string> => {
    if (session?.sessionToken) {
      return { 'X-Wallet-Session': session.sessionToken }
    }
    return {}
  }, [session])

  // Authenticate wallet (nonce → sign → verify)
  const authenticate = useCallback(async (walletAddress: string): Promise<boolean> => {
    const now = Date.now()
    if (authCooldownUntilRef.current && now < authCooldownUntilRef.current) {
      setError('Please wait a moment before retrying.')
      return false
    }
    if (authInFlightRef.current) return false
    authInFlightRef.current = true

    if (!window.ethereum) {
      setError('No wallet found')
      authInFlightRef.current = false
      return false
    }

    setIsAuthenticating(true)
    setError(null)

    try {
      // Step 1: Request nonce
      const nonceRes = await fetch(`${API_URL}/wallet/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress })
      })

      if (!nonceRes.ok) {
        if (nonceRes.status === 429) {
          authCooldownUntilRef.current = Date.now() + AUTH_COOLDOWN_MS
          throw new Error('Too many requests. Please wait a moment and try again.')
        }
        const data = await nonceRes.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to get nonce')
      }

      const { message, nonce } = await nonceRes.json()

      // Step 2: Sign message with wallet
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress]
      }) as string

      // Step 3: Verify signature and get session
      const verifyRes = await fetch(`${API_URL}/wallet/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress, signature })
      })

      if (!verifyRes.ok) {
        if (verifyRes.status === 429) {
          authCooldownUntilRef.current = Date.now() + AUTH_COOLDOWN_MS
        }
        const data = await verifyRes.json()
        throw new Error(data.error || 'Failed to verify signature')
      }

      const { sessionToken, expiresAt } = await verifyRes.json()

      // Save session
      const newSession: WalletSession = {
        sessionToken,
        walletAddress,
        expiresAt
      }
      setSession(newSession)
      saveSession(newSession)
      try {
        localStorage.setItem(SIGNED_IN_KEY, newSession.walletAddress.toLowerCase())
      } catch {}

      // Fetch entitlements after authentication
      await fetchEntitlementsInternal(sessionToken)

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      console.error('[Auth] Error:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsAuthenticating(false)
      authInFlightRef.current = false
    }
  }, [])

  // Internal fetch entitlements (with token parameter)
  const fetchEntitlementsInternal = async (token: string): Promise<Entitlement[]> => {
    const now = Date.now()
    if (entitlementsInFlight) return entitlements
    if (entitlementsCooldownUntil && now < entitlementsCooldownUntil) return entitlements
    if (now - lastEntitlementsAt < ENTITLEMENTS_MIN_INTERVAL_MS) return entitlements

    entitlementsInFlight = true
    lastEntitlementsAt = now
    try {
      const res = await fetch(`${API_URL}/wallet/entitlements`, {
        headers: { 'X-Wallet-Session': token }
      })

      if (!res.ok) {
        if (res.status === 429) {
          entitlementsCooldownUntil = Date.now() + AUTH_COOLDOWN_MS
        }
        console.warn('[Entitlements] Failed to fetch')
        return []
      }

      const data = await res.json()
      const activeEntitlements = data.active || []
      setEntitlements(activeEntitlements)
      return activeEntitlements
    } catch (err) {
      console.error('[Entitlements] Error:', err)
      return []
    } finally {
      entitlementsInFlight = false
    }
  }

  // Public fetch entitlements
  const fetchEntitlements = useCallback(async (): Promise<Entitlement[]> => {
    if (!session?.sessionToken) return []
    return fetchEntitlementsInternal(session.sessionToken)
  }, [session])

  // Check if user has access to asset - requires authentication
  const hasAccessTo = useCallback((assetId: string): boolean => {
    // Must be authenticated to have access
    if (!session) return false
    
    return entitlements.some(e => 
      e.assetId === assetId && 
      new Date(e.expiresAt) > new Date()
    )
  }, [session, entitlements])

  // Refresh session (check if still valid)
  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (!session?.sessionToken) return false
    const now = Date.now()
    if (sessionVerifyInFlight) return true
    if (sessionCooldownUntil && now < sessionCooldownUntil) return true
    if (now - lastSessionVerifyAt < SESSION_VERIFY_MIN_INTERVAL_MS) return true

    try {
      sessionVerifyInFlight = true
      lastSessionVerifyAt = now
      const res = await fetch(`${API_URL}/wallet/session`, {
        headers: { 'X-Wallet-Session': session.sessionToken }
      })

      if (!res.ok) {
        if (res.status === 429) {
          sessionCooldownUntil = Date.now() + AUTH_COOLDOWN_MS
          return true
        }
        // Session invalid, clear it
        setSession(null)
        saveSession(null)
        setEntitlements([])
        try {
          localStorage.removeItem(SIGNED_IN_KEY)
        } catch {}
        return false
      }

      const data = await res.json()
      if (!data.authenticated) {
        setSession(null)
        saveSession(null)
        setEntitlements([])
        try {
          localStorage.removeItem(SIGNED_IN_KEY)
        } catch {}
        return false
      }

      // Update expiry if provided
      if (data.expiresAt) {
        const updatedSession = { ...session, expiresAt: data.expiresAt }
        setSession(updatedSession)
        saveSession(updatedSession)
      }

      return true
    } catch {
      return false
    } finally {
      sessionVerifyInFlight = false
    }
  }, [session])

  // Logout
  const logout = useCallback(async () => {
    if (session?.sessionToken) {
      try {
        await fetch(`${API_URL}/wallet/logout`, {
          method: 'POST',
          headers: { 'X-Wallet-Session': session.sessionToken }
        })
      } catch {
        // Ignore logout errors
      }
    }

    setSession(null)
    saveSession(null)
    setEntitlements([])
    setError(null)
    try {
      localStorage.removeItem(SIGNED_IN_KEY)
    } catch {}
  }, [session])

  // Verify session on mount - runs ONCE
  useEffect(() => {
    const currentSession = loadSession() // Read from localStorage directly
    if (currentSession) {
      const now = Date.now()
      if (sessionVerifyInFlight) {
        setIsVerifyingSession(false)
        return
      }
      if (sessionCooldownUntil && now < sessionCooldownUntil) {
        setIsVerifyingSession(false)
        return
      }
      if (now - lastSessionVerifyAt < SESSION_VERIFY_MIN_INTERVAL_MS) {
        setIsVerifyingSession(false)
        return
      }
      setIsVerifyingSession(true)
      // Verify session is still valid on server
      sessionVerifyInFlight = true
      lastSessionVerifyAt = now
      fetch(`${API_URL}/wallet/session`, {
        headers: { 'X-Wallet-Session': currentSession.sessionToken }
      })
        .then(res => {
          if (!res.ok) {
            if (res.status === 429) {
              sessionCooldownUntil = Date.now() + AUTH_COOLDOWN_MS
              setIsVerifyingSession(false)
              return null
            }
            // Server rejected session (401, 403, etc.) - clear it
            setSession(null)
            saveSession(null)
            setEntitlements([])
            try {
              localStorage.removeItem(SIGNED_IN_KEY)
            } catch {}
            setIsVerifyingSession(false)
            return null
          }
          return res.json()
        })
        .then(data => {
          if (!data) return // Already handled error case
          
          if (data.authenticated) {
            // Session valid, update session with any new expiry date from server
            const updatedSession: WalletSession = {
              ...currentSession,
              // Update expiresAt if server provided a new one
              expiresAt: data.expiresAt || currentSession.expiresAt
            }
            setSession(updatedSession)
            saveSession(updatedSession) // Save updated session to localStorage
            fetchEntitlementsInternal(currentSession.sessionToken)
          } else {
            // Session invalid according to server
            setSession(null)
            saveSession(null)
            setEntitlements([])
            try {
              localStorage.removeItem(SIGNED_IN_KEY)
            } catch {}
          }
          setIsVerifyingSession(false)
        })
        .catch((err) => {
          // Network error - keep session but mark verification as done
          console.error('[Session] Error verifying session:', err)
          // Don't clear session on network error - might be temporary
          setIsVerifyingSession(false)
        })
        .finally(() => {
          sessionVerifyInFlight = false
        })
    } else {
      setIsVerifyingSession(false)
    }
  }, []) // Empty deps = mount only

  // Clear session if wallet address changes externally
  const clearSessionForWallet = useCallback((newWalletAddress: string | null) => {
    if (session && newWalletAddress?.toLowerCase() !== session.walletAddress.toLowerCase()) {
      setSession(null)
      saveSession(null)
      setEntitlements([])
      try {
        localStorage.removeItem(SIGNED_IN_KEY)
      } catch {}
    }
  }, [session])

  return {
    session,
    isAuthenticated,
    isAuthenticating,
    isVerifyingSession,
    entitlements,
    error,
    authenticate,
    logout,
    refreshSession,
    fetchEntitlements,
    hasAccessTo,
    getSessionHeader,
    // Export for external wallet change detection
    _clearSessionForWallet: clearSessionForWallet
  } as UseWalletSessionResult & { _clearSessionForWallet: (addr: string | null) => void }
}

