"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import App from '../../features/app/src/App'
import { useWalletSession } from '../../features/auth/hooks/use-wallet-session'

const SIGNED_IN_KEY = 'qcumb_signed_in_v1'

export default function AppClient() {
  const router = useRouter()
  const { isAuthenticated, isVerifyingSession } = useWalletSession()
  const [hasSignedIn, setHasSignedIn] = useState(() => {
    try {
      return localStorage.getItem(SIGNED_IN_KEY) !== null
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      setHasSignedIn(localStorage.getItem(SIGNED_IN_KEY) !== null)
    } catch {
      setHasSignedIn(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isVerifyingSession && (!isAuthenticated || !hasSignedIn)) {
      router.push('/login')
    }
  }, [isAuthenticated, isVerifyingSession, hasSignedIn, router])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const html = document.documentElement
    const body = document.body
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow
    html.style.overflow = 'auto'
    body.style.overflow = 'auto'
    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
    }
  }, [])

  if (!isAuthenticated || !hasSignedIn) {
    return null
  }

  return <App />
}
