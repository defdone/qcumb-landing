import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import SecureVideoPlayer from './components/secure-video-player'
import SecureImageViewer from './components/secure-image-viewer'
import PaymentModal from './components/payment-modal'
import WalletConnect from './components/wallet-connect'
import SkeletonLoader from './components/skeleton-loader'
import SuccessAnimation from './components/success-animation'
import { planSelectorStyles } from './components/plan-selector'
import { useX402Payment, PlanType } from './hooks/use-x402-payment'
import { useWalletSession } from './hooks/use-wallet-session'
import { API_URL } from './config/x402-config'
import './App.css'

interface MediaInfo {
  id: string
  title: string
  type: 'video' | 'image'
  mimeType: string
  previewUrl: string
  pricing: {
    '24h': { price: number; priceFormatted: string }
    '7d': { price: number; priceFormatted: string }
  }
  hasAccess?: boolean // Set by backend when X-Wallet-Session header is present
  entitlement?: {
    expiresAt: string
    planType: '24h' | '7d'
  } | null
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [serverStatus, setServerStatus] = useState<{
    online: boolean | null
    network: string | null
  }>({ online: true, network: null }) // Start with online: true to allow immediate fetching
  const [mediaKey, setMediaKey] = useState(0) // Key to force re-render media components
  const [mediaList, setMediaList] = useState<MediaInfo[]>([]) // Media list from API
  const [isLoadingMedia, setIsLoadingMedia] = useState(true) // Loading state for media list
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false) // Success animation state
  const previousWalletAddress = useRef<string | null>(null) // Track wallet address changes
  const fetchMediaListTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Debounce fetchMediaList
  const isFetchingMediaListRef = useRef<boolean>(false) // Prevent concurrent fetches
  const hasAutoAuthenticatedRef = useRef<boolean>(false) // Prevent multiple auto-authenticate calls
  const hasCheckedServerRef = useRef<boolean>(false) // Prevent multiple server checks
  const hasFetchedMediaListRef = useRef<boolean>(false) // Prevent multiple media list fetches on mount
  const previousIsAuthenticatedRef = useRef<boolean | null>(null) // Track authentication state changes
  
  // Use sessionStorage to persist flags across hot reloads
  const getSessionFlag = (key: string): boolean => {
    try {
      return sessionStorage.getItem(key) === 'true'
    } catch {
      return false
    }
  }
  const setSessionFlag = (key: string, value: boolean) => {
    try {
      sessionStorage.setItem(key, value ? 'true' : 'false')
    } catch {
      // Ignore errors
    }
  }

  // Wallet session hook for authentication
  const {
    isAuthenticated,
    isAuthenticating,
    isVerifyingSession,
    authenticate,
    logout: sessionLogout,
    fetchEntitlements,
    getSessionHeader
  } = useWalletSession()

  // Payment hook
  const {
    paymentStatus,
    paymentRequirements,
    walletAddress,
    transactionHash,
    error,
    pricing,
    selectedPlan,
    connectWallet,
    disconnectWallet,
    requestPayment,
    executePayment,
    resetPayment,
    setSelectedPlan
  } = useX402Payment()

  // Fetch media list from API - sends X-Wallet-Session header if authenticated
  // Debounced to prevent multiple concurrent requests
  const fetchMediaList = useCallback(async (immediate = false) => {
    // Clear any pending timeout
    if (fetchMediaListTimeoutRef.current) {
      clearTimeout(fetchMediaListTimeoutRef.current)
      fetchMediaListTimeoutRef.current = null
    }

    const doFetch = async () => {
      // Prevent concurrent fetches
      if (isFetchingMediaListRef.current) {
        return
      }

      // Prevent multiple fetches on mount/hot reload (only for debounced calls, not immediate)
      // For immediate calls (after auth, payment, etc.), allow refresh even if already fetched
      const hasFetchedKey = 'x402_hasFetchedMediaList'
      if (!immediate && (hasFetchedMediaListRef.current || getSessionFlag(hasFetchedKey))) {
        return
      }
      
      // For immediate calls, allow refresh if data might have changed (e.g., after payment, auth)
      // This ensures we get updated hasAccess status after authentication

      isFetchingMediaListRef.current = true
      // Only show loading state on initial load, not on background refresh
      // This prevents flickering when auto-refreshing
      const isInitialLoad = !hasFetchedMediaListRef.current && !getSessionFlag(hasFetchedKey)
      if (isInitialLoad) {
        setIsLoadingMedia(true)
      }
      try {
        const headers: Record<string, string> = {}
        const sessionHeader = getSessionHeader()
        if (sessionHeader['X-Wallet-Session']) {
          headers['X-Wallet-Session'] = sessionHeader['X-Wallet-Session']
        }
        
        const response = await fetch(`${API_URL}/media`, { headers })
        if (response.ok) {
          const data = await response.json()
          if (data.media && Array.isArray(data.media)) {
            // Only update if data actually changed to prevent unnecessary re-renders
            setMediaList(prevList => {
              const newList = data.media
              
              // Deep comparison to prevent re-renders if nothing changed
              if (prevList.length !== newList.length) {
                return newList
              }
              
              // Check if any item changed (compare all relevant fields)
              const hasChanges = prevList.some((prev, idx) => {
                const next = newList[idx]
                if (!next) return true
                
                // Compare all fields that matter
                return prev.id !== next.id || 
                  prev.title !== next.title ||
                  prev.type !== next.type ||
                  prev.mimeType !== next.mimeType ||
                  prev.previewUrl !== next.previewUrl ||
                  prev.hasAccess !== next.hasAccess ||
                  prev.entitlement?.expiresAt !== next.entitlement?.expiresAt ||
                  prev.entitlement?.planType !== next.entitlement?.planType
              })
              
              // Only update if something actually changed
              if (!hasChanges) {
                return prevList
              }
              
              return newList
            })
          } else {
            console.warn('[App] Invalid media list format:', data)
            setMediaList([])
          }
        } else {
          console.error('[App] Failed to fetch media list:', response.status, response.statusText)
        }
      } catch (err) {
        // Only log network errors in development, suppress in production
        if (import.meta.env.DEV) {
          console.error('[App] Failed to fetch media list:', err)
        }
        // Don't show error to user - network errors are expected when offline
      } finally {
        isFetchingMediaListRef.current = false
        // Only clear loading state if we set it (initial load)
        if (isInitialLoad) {
          setIsLoadingMedia(false)
        }
        // Mark as fetched only for initial load (not for immediate refreshes after auth/payment)
        // This allows refreshing list after authentication to get updated hasAccess status
        if (!immediate && isInitialLoad) {
          hasFetchedMediaListRef.current = true
          setSessionFlag('x402_hasFetchedMediaList', true)
        }
      }
    }

    if (immediate) {
      await doFetch()
    } else {
      // Debounce: wait 300ms before fetching
      fetchMediaListTimeoutRef.current = setTimeout(() => {
        doFetch()
        fetchMediaListTimeoutRef.current = null
      }, 300)
    }
  }, [getSessionHeader])

  // Add dashboard mode class when on /app route
  useEffect(() => {
    if (location.pathname === '/app') {
      document.body.classList.add('dashboard-mode')
    } else {
      document.body.classList.remove('dashboard-mode')
    }
    return () => {
      document.body.classList.remove('dashboard-mode')
    }
  }, [location.pathname])

  // Check server status - runs ONCE on mount, no polling
  // Protected against React.StrictMode and hot reload
  useEffect(() => {
    // Prevent multiple checks (React.StrictMode runs effects twice in dev, hot reload can trigger multiple times)
    if (hasCheckedServerRef.current) {
      return
    }
    hasCheckedServerRef.current = true

    let isMounted = true

    const checkServer = async () => {
      try {
        const response = await fetch(`${API_URL}/health`, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        })
        if (!isMounted) return
        
        if (response.ok) {
          const data = await response.json()
          const network = data?.payment?.network || data?.network || null
          setServerStatus({ online: true, network })
        } else {
          // Even if error (including 429), assume server is online
          setServerStatus({ online: true, network: null })
        }
      } catch {
        // Even on error, assume server is online (don't show offline)
        if (!isMounted) return
        setServerStatus({ online: true, network: null })
      }
    }

    // Single check on mount - NO POLLING
    checkServer()
    
    return () => {
      isMounted = false
    }
  }, []) // Empty dependency array - run only once on mount

  // Auto-refresh media list - only when page becomes visible (not on interval)
  // This prevents constant refreshing and flickering
  useEffect(() => {
    // Don't start if server is explicitly offline
    if (serverStatus.online === false) return
    
    // Only refresh when page becomes visible (user returns to tab)
    // This is how production apps handle background updates - no constant polling
    const handleVisibilityChange = () => {
      if (!document.hidden && hasFetchedAfterMountRef.current) {
        // Silent background refresh - no loading state, smart comparison prevents re-render
        fetchMediaList(true)
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverStatus.online]) // fetchMediaList is stable (useCallback)

  // Refresh entitlements and media list after successful payment
  useEffect(() => {
    if (paymentStatus === 'success') {
      fetchEntitlements()
      fetchMediaList(true) // Immediate fetch after payment
      // Force re-render media components to fetch new stream tokens
      setMediaKey(prev => prev + 1)
    }
  }, [paymentStatus, fetchEntitlements, fetchMediaList])

  // Auto-authenticate when wallet is connected but not authenticated
  // This runs immediately when walletAddress changes (after connect or reconnect)
  // BUT: Don't authenticate if we're verifying an existing session (to avoid duplicate sign requests)
  useEffect(() => {
    const walletChanged = previousWalletAddress.current !== walletAddress
    const authKey = `x402_hasAutoAuthenticated_${walletAddress || 'none'}`
    
    // Reset flag when wallet changes
    if (walletChanged) {
      hasAutoAuthenticatedRef.current = false
      if (previousWalletAddress.current) {
        setSessionFlag(`x402_hasAutoAuthenticated_${previousWalletAddress.current}`, false)
      }
    }
    
    // Prevent infinite loop - only authenticate once per wallet address
    // Check both ref and sessionStorage (for hot reload protection)
    if (hasAutoAuthenticatedRef.current || getSessionFlag(authKey)) {
      previousWalletAddress.current = walletAddress
      return
    }
    
    const walletJustConnected = walletChanged && walletAddress !== null && previousWalletAddress.current === null
    
    // Don't auto-authenticate if:
    // 1. We're already authenticated
    // 2. We're currently authenticating
    // 3. We're verifying an existing session (to avoid duplicate sign requests on page refresh)
    if (walletJustConnected || (walletAddress && !isAuthenticated && !isAuthenticating && !isVerifyingSession)) {
      hasAutoAuthenticatedRef.current = true
      setSessionFlag(authKey, true)
      previousWalletAddress.current = walletAddress
      let cancelled = false
      
      authenticate(walletAddress!)
        .then((success) => {
          if (cancelled) return
          if (success) {
            // Refresh media list after authentication (debounced)
            if (!cancelled) {
              fetchMediaList()
            }
          } else {
          }
        })
        .catch((err) => {
          if (!cancelled) {
            console.error('[App] Auto-authentication error:', err)
          }
        })
      
      return () => {
        cancelled = true
      }
    } else {
      previousWalletAddress.current = walletAddress
    }
  }, [walletAddress, isAuthenticated, isAuthenticating, isVerifyingSession])

  // Track if we've done initial fetch after mount/verification
  const hasFetchedAfterMountRef = useRef(false)
  const previousIsVerifyingRef = useRef<boolean | undefined>(undefined)
  
  // Fetch media list IMMEDIATELY on mount (preview doesn't need session)
  // Preview should always display, only hasAccess depends on session
  useEffect(() => {
    // Prevent multiple fetches on hot reload (check sessionStorage, not ref)
    const hasFetchedKey = 'x402_hasFetchedMediaList'
    if (getSessionFlag(hasFetchedKey)) {
      hasFetchedMediaListRef.current = true
      hasFetchedAfterMountRef.current = true
      return
    }
    
    // Fetch immediately - preview doesn't need session, only hasAccess does
    // This allows preview to show instantly while session verification happens in background
    if (serverStatus.online && !hasFetchedAfterMountRef.current) {
      hasFetchedAfterMountRef.current = true
      // Immediate fetch for first load (no debounce) - faster loading
      // This will fetch WITHOUT session header first, then refresh WITH header after verification
      fetchMediaList(true)
    }
    
    previousIsVerifyingRef.current = isVerifyingSession
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverStatus.online]) // Only depend on serverStatus, not isVerifyingSession
  
  // After session verification completes, refresh media list WITH session header
  // This updates hasAccess status for each media item
  useEffect(() => {
    // Only refresh if we already fetched initial list and verification just completed
    const verificationJustCompleted = previousIsVerifyingRef.current === true && isVerifyingSession === false
    
    if (verificationJustCompleted && hasFetchedAfterMountRef.current && serverStatus.online && isAuthenticated) {
      // Refresh with session header to get updated hasAccess status
      fetchMediaList(true)
    }
    
    previousIsVerifyingRef.current = isVerifyingSession
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVerifyingSession, isAuthenticated, serverStatus.online]) // fetchMediaList is stable (useCallback)

  // Refresh media list when session state changes AFTER initial mount
  // (e.g., user connects/disconnects wallet, not on page refresh)
  useEffect(() => {
    // Skip initial mount - only react to changes after mount
    // Don't wait for serverStatus.online to be true - assume online if not explicitly false
    if (serverStatus.online === false || isVerifyingSession || !hasFetchedAfterMountRef.current) {
      return
    }

    // Skip if this is the first time (initial mount after verification)
    if (previousIsAuthenticatedRef.current === null) {
      previousIsAuthenticatedRef.current = isAuthenticated
      return
    }

    // Only fetch if authentication state actually changed
    if (previousIsAuthenticatedRef.current !== isAuthenticated) {
      previousIsAuthenticatedRef.current = isAuthenticated
      // Immediate fetch to get updated hasAccess status after authentication
      // This is important - we need to refresh to get access status with session header
      fetchMediaList(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isVerifyingSession, serverStatus.online]) // fetchMediaList is stable (useCallback)

  // Handle wallet connect - authentication will happen automatically via useEffect
  const handleConnect = async () => {
    await connectWallet()
    // Authentication will be triggered by useEffect when walletAddress changes
  }

  // Handle disconnect - clear both wallet and session
  const handleDisconnect = () => {
    sessionLogout()
    disconnectWallet()
    // Return to landing page
    navigate('/', { replace: true })
  }

  // Cleanup debounced media fetch on unmount (e.g., route change)
  useEffect(() => {
    return () => {
      if (fetchMediaListTimeoutRef.current) {
        clearTimeout(fetchMediaListTimeoutRef.current)
        fetchMediaListTimeoutRef.current = null
      }
    }
  }, [])

  const handlePaymentRequest = async (mediaId: string, mediaType: 'video' | 'image') => {
    if (!walletAddress) {
      await handleConnect()
      return
    }

    // If not authenticated, authenticate first
    if (!isAuthenticated) {
      const success = await authenticate(walletAddress)
      if (!success) {
        return
      }
    }

    await requestPayment(mediaId, mediaType, getSessionHeader())
    setShowPaymentModal(true)
  }

  const handlePaymentExecute = async () => {
    const success = await executePayment(getSessionHeader())
    if (success) {
      setShowSuccessAnimation(true)
      // Refresh media list after successful payment
      setTimeout(() => {
        fetchMediaList(true)
        setMediaKey(prev => prev + 1) // Force re-render media components
      }, 500)
    }
  }

  const handlePaymentCancel = () => {
    setShowPaymentModal(false)
    resetPayment()
  }

  const handlePlanSelect = (plan: PlanType) => {
    setSelectedPlan(plan)
  }

  return (
    <div className="app app-dashboard">
      {/* Inject plan selector styles */}
      <style>{planSelectorStyles}</style>
      
      <nav className="dashboard-nav">
        <div className="dashboard-nav-inner">
          <div className="dashboard-logo-wrapper">
            <div className="dashboard-logo">defdone</div>
            <span className="dashboard-logo-badge">web3</span>
          </div>
          <div className="dashboard-nav-right">
            <div className="dashboard-status">
              <div className="dashboard-status-item">
                <span className={`status-dot ${serverStatus.online === null ? 'checking' : serverStatus.online ? 'online' : 'offline'}`}></span>
                <span className="status-text">
                  {serverStatus.online === null ? 'Connecting...' : serverStatus.online ? (
                    serverStatus.network?.includes('84532') || serverStatus.network?.includes('sepolia') 
                      ? 'Base Sepolia' 
                      : serverStatus.network?.includes('8453') || serverStatus.network === 'base'
                        ? 'Base Mainnet'
                        : serverStatus.network || 'Connected'
                  ) : 'Server Offline'}
                </span>
              </div>
              {isAuthenticated && (
                <div className="dashboard-status-item authenticated">
                  <span className="status-dot online"></span>
                  <span className="status-text">Session Active</span>
                </div>
              )}
            </div>
            <WalletConnect
              walletAddress={walletAddress}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              isConnecting={paymentStatus === 'connecting' || isAuthenticating}
            />
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Media Library</h1>
          <p className="dashboard-subtitle">
            {isAuthenticated 
              ? 'Browse and access premium content' 
              : 'Connect your wallet to unlock premium content'}
          </p>
        </div>

      <main className="demo-container">
        {isLoadingMedia ? (
          <div className="media-grid">
            <SkeletonLoader count={3} />
          </div>
        ) : mediaList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <h3 className="empty-state-title">No media available</h3>
            <p className="empty-state-description">Media content will appear here once available.</p>
          </div>
        ) : (
          <div className="media-grid">
            {mediaList.map((media) => {
              const hasAccess = media.hasAccess ?? false
              
              return (
                <div key={media.id} className="media-card">
                  <div className="media-card-header">
                    <h3 className="media-title">{media.title}</h3>
                    <div className={`media-status ${hasAccess ? 'status-success' : 'status-locked'}`}>
                      {hasAccess ? (
                        <>
                          <span>Access granted</span>
                          {media.entitlement?.expiresAt && (
                            <span className="status-expire">
                              · Expires {new Date(media.entitlement.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </>
                      ) : (
                        <span>Locked content</span>
                      )}
                    </div>
                  </div>

                  <div className="media-frame">
                    {media.type === 'video' ? (
                      <SecureVideoPlayer
                        key={`${media.id}-${mediaKey}`}
                        assetId={media.id}
                        isLocked={!hasAccess}
                        hasAccess={hasAccess}
                        onPaymentRequest={() => handlePaymentRequest(media.id, 'video')}
                        serverOnline={serverStatus.online}
                        getSessionHeader={getSessionHeader}
                        previewUrl={media.previewUrl}
                      />
                    ) : (
                      <SecureImageViewer
                        key={`${media.id}-${mediaKey}`}
                        assetId={media.id}
                        isLocked={!hasAccess}
                        hasAccess={hasAccess}
                        onPaymentRequest={() => handlePaymentRequest(media.id, 'image')}
                        serverOnline={serverStatus.online}
                        getSessionHeader={getSessionHeader}
                        previewUrl={media.previewUrl}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        </main>
      </div>

      <PaymentModal
        show={showPaymentModal}
        paymentRequirements={paymentRequirements}
        paymentStatus={paymentStatus}
        walletAddress={walletAddress}
        transactionHash={transactionHash}
        error={error}
        onPayment={handlePaymentExecute}
        onCancel={handlePaymentCancel}
        onConnectWallet={handleConnect}
        pricing={pricing}
        selectedPlan={selectedPlan}
        onPlanSelect={handlePlanSelect}
      />

      <SuccessAnimation 
        show={showSuccessAnimation} 
        onComplete={() => setShowSuccessAnimation(false)}
      />
    </div>
  )
}

export default App