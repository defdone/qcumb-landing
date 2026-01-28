"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import App from "../../features/app/src/App"
import { useWalletSession } from "../../features/auth/hooks/use-wallet-session"
import { queryClient } from "../../features/app/src/lib/queryClient"
import { useIsFetching } from "@tanstack/react-query"

export default function AppClient() {
  const { isVerifyingSession } = useWalletSession()
  const [showSplash, setShowSplash] = useState(true)
  const [initialSplashDone, setInitialSplashDone] = useState(false)
  const isFetching = useIsFetching()
  const [hasStartedFetching, setHasStartedFetching] = useState(false)

  useEffect(() => {
    const cache = queryClient.getQueryCache()
    if (isFetching > 0 || cache.getAll().length > 0) {
      setHasStartedFetching(true)
    }
  }, [isFetching])

  useEffect(() => {
    if (isVerifyingSession) return

    let raf1 = 0
    let raf2 = 0
    let timeoutId: number | null = null

    const hideSplash = () => {
      if (initialSplashDone) return
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setShowSplash(false)
          setInitialSplashDone(true)
        })
      })
    }

    const isQueryReady = !hasStartedFetching || isFetching === 0

    if (document.readyState === "complete" && isQueryReady) {
      hideSplash()
      return () => {
        cancelAnimationFrame(raf1)
        cancelAnimationFrame(raf2)
        if (timeoutId) window.clearTimeout(timeoutId)
      }
    }

    const onReady = () => {
      if (!hasStartedFetching || queryClient.isFetching() === 0) {
        hideSplash()
      }
    }
    window.addEventListener("load", onReady, { once: true })
    timeoutId = window.setTimeout(hideSplash, 8000)
    return () => {
      window.removeEventListener("load", onReady)
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [isVerifyingSession, hasStartedFetching, isFetching, initialSplashDone])

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

  if (!initialSplashDone && (showSplash || isVerifyingSession || (hasStartedFetching && isFetching > 0))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-6">
          <Image
            src="/logoQC - base - H.png"
            alt="qcumb"
            width={220}
            height={60}
            className="h-auto w-auto animate-pulse"
            priority
          />
        </div>
      </div>
    )
  }

  return <App />
}
