import { useState, useEffect, useCallback, useRef } from 'react'
import SecureVideoPlayer from './components/secure-video-player'
import SecureImageViewer from './components/secure-image-viewer'
import PaymentModal from './components/payment-modal'
import WalletConnect from './components/wallet-connect'
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
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [currentMediaId, setCurrentMediaId] = useState<string | null>(null)
  const [currentMediaType, setCurrentMediaType] = useState<'video' | 'image' | null>(null)
  const [serverStatus, setServerStatus] = useState<{
    online: boolean | null
    network: string | null
  }>({ online: null, network: null })
  const [mediaKey, setMediaKey] = useState(0) // Key to force re-render media components
  const [mediaList, setMediaList] = useState<MediaInfo[]>([]) // Media list from API
  const previousWalletAddress = useRef<string | null>(null) // Track wallet address changes
  const fetchMediaListTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Debounce fetchMediaList
  const isFetchingMediaListRef = useRef<boolean>(false) // Prevent concurrent fetches

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
        console.log('[App] Media list fetch already in progress, skipping...')
        return
      }

      isFetchingMediaListRef.current = true
      try {
        const headers: Record<string, string> = {}
        const sessionHeader = getSessionHeader()
        if (sessionHeader['X-Wallet-Session']) {
          headers['X-Wallet-Session'] = sessionHeader['X-Wallet-Session']
          console.log('[App] Fetching media list WITH session header')
        } else {
          console.log('[App] Fetching media list WITHOUT session header')
        }
        
        const response = await fetch(`${API_URL}/media`, { headers })
        if (response.ok) {
          const data = await response.json()
          if (data.media && Array.isArray(data.media)) {
            console.log('[App] Media list received:', data.media.length, 'items')
            setMediaList(data.media)
          } else {
            console.warn('[App] Invalid media list format:', data)
            setMediaList([])
          }
        } else {
          console.error('[App] Failed to fetch media list:', response.status, response.statusText)
        }
      } catch (err) {
        console.error('[App] Failed to fetch media list:', err)
      } finally {
        isFetchingMediaListRef.current = false
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

  // Check server status - runs ONCE on mount, no polling
  useEffect(() => {
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
          // Don't fetch media list here - wait for session verification to complete
          // This prevents duplicate fetches on page load
        } else {
          setServerStatus({ online: false, network: null })
        }
      } catch {
        if (!isMounted) return
        setServerStatus({ online: false, network: null })
      }
    }

    // Single check on mount - NO POLLING
    checkServer()
    
    return () => {
      isMounted = false
    }
  }, [fetchMediaList])

  // Auto-refresh media list every 30 seconds to see new media added by admin
  useEffect(() => {
    if (!serverStatus.online) return
    
    const interval = setInterval(() => {
      fetchMediaList()
    }, 30000) // 30 seconds
    
    return () => clearInterval(interval)
  }, [serverStatus.online, fetchMediaList])

  // Refresh entitlements and media list after successful payment
  useEffect(() => {
    if (paymentStatus === 'success') {
      console.log('[App] Payment success, refreshing entitlements and media list...')
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
    const walletJustConnected = walletChanged && walletAddress !== null && previousWalletAddress.current === null
    
    // Don't auto-authenticate if:
    // 1. We're already authenticated
    // 2. We're currently authenticating
    // 3. We're verifying an existing session (to avoid duplicate sign requests on page refresh)
    // 4. Server is offline
    if (walletJustConnected || (walletAddress && !isAuthenticated && !isAuthenticating && !isVerifyingSession && serverStatus.online)) {
      console.log('[App] Wallet connected, auto-authenticating...', walletAddress, 'walletJustConnected:', walletJustConnected)
      let cancelled = false
      
      authenticate(walletAddress!)
        .then((success) => {
          if (cancelled) return
          if (success) {
            console.log('[App] Auto-authentication successful, refreshing media list...')
            // Refresh media list after authentication (debounced)
            if (!cancelled) {
              fetchMediaList()
            }
          } else {
            console.log('[App] Auto-authentication failed')
          }
        })
        .catch((err) => {
          if (!cancelled) {
            console.error('[App] Auto-authentication error:', err)
          }
        })
      
      previousWalletAddress.current = walletAddress
      
      return () => {
        cancelled = true
      }
    } else if (walletChanged) {
      // Update ref even if we don't authenticate (e.g., wallet disconnected)
      previousWalletAddress.current = walletAddress
    }
  }, [walletAddress, isAuthenticated, isAuthenticating, isVerifyingSession, authenticate, serverStatus.online, fetchMediaList])

  // Track if we've done initial fetch after mount/verification
  const hasFetchedAfterMountRef = useRef(false)
  const previousIsVerifyingRef = useRef<boolean | undefined>(undefined)
  
  // Refresh media list when session verification completes (on page refresh)
  // This is the PRIMARY place to fetch after page load
  useEffect(() => {
    // Detect when verification just completed (transition from true to false)
    const verificationJustCompleted = previousIsVerifyingRef.current === true && isVerifyingSession === false
    
    if (serverStatus.online && !isVerifyingSession) {
      if (!hasFetchedAfterMountRef.current || verificationJustCompleted) {
        console.log('[App] Fetching media list after verification completes...', {
          hasFetchedAfterMount: hasFetchedAfterMountRef.current,
          verificationJustCompleted
        })
        hasFetchedAfterMountRef.current = true
        // Debounced fetch - will combine multiple rapid changes
        fetchMediaList()
      }
    }
    
    previousIsVerifyingRef.current = isVerifyingSession
  }, [isVerifyingSession, serverStatus.online, fetchMediaList])

  // Refresh media list when session state changes AFTER initial mount
  // (e.g., user connects/disconnects wallet, not on page refresh)
  useEffect(() => {
    // Skip initial mount - only react to changes after mount
    if (!serverStatus.online || isVerifyingSession || !hasFetchedAfterMountRef.current) {
      return
    }

    // Only fetch if session state changed AFTER initial mount
    if (isAuthenticated) {
      console.log('[App] Session authenticated (after mount), refreshing media list...')
    } else {
      console.log('[App] Session disconnected (after mount), refreshing media list without header')
    }
    // Debounced fetch - will combine multiple rapid changes
    fetchMediaList()
  }, [isAuthenticated, isVerifyingSession, fetchMediaList, serverStatus.online])

  // Handle wallet connect - authentication will happen automatically via useEffect
  const handleConnect = async () => {
    await connectWallet()
    // Authentication will be triggered by useEffect when walletAddress changes
  }

  // Handle disconnect - clear both wallet and session
  const handleDisconnect = () => {
    sessionLogout()
    disconnectWallet()
    // Refresh media list without session header (debounced)
    fetchMediaList()
  }

  const handlePaymentRequest = async (mediaId: string, mediaType: 'video' | 'image') => {
    setCurrentMediaId(mediaId)
    setCurrentMediaType(mediaType)
    
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
    await executePayment(getSessionHeader())
  }

  const handlePaymentCancel = () => {
    setShowPaymentModal(false)
    setCurrentMediaId(null)
    setCurrentMediaType(null)
    resetPayment()
  }

  const handlePlanSelect = (plan: PlanType) => {
    setSelectedPlan(plan)
  }

  return (
    <div className="app">
      {/* Inject plan selector styles */}
      <style>{planSelectorStyles}</style>
      
      <header className="app-header">
        <div className="header-top">
          <h1>x402 Payment Demo</h1>
          <WalletConnect
            walletAddress={walletAddress}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            isConnecting={paymentStatus === 'connecting' || isAuthenticating}
          />
        </div>
        <p className="description">
          Demo x402 protocol with USDC payments on Base Sepolia.
          {isAuthenticated ? (
            <> Authenticated</>
          ) : (
            <> Connect wallet to unlock premium content.</>
          )}
        </p>
        <div className="status-badges">
          <div className="status-badge">
            <span className={`status-dot ${serverStatus.online === null ? 'checking' : serverStatus.online ? 'online' : 'offline'}`}></span>
            {serverStatus.online === null ? 'Connecting...' : serverStatus.online ? (
              serverStatus.network?.includes('84532') || serverStatus.network?.includes('sepolia') 
                ? 'Base Sepolia' 
                : serverStatus.network?.includes('8453') || serverStatus.network === 'base'
                  ? 'Base Mainnet'
                  : serverStatus.network || 'Connected'
            ) : 'Server Offline'}
          </div>
          {isAuthenticated && (
            <div className="status-badge authenticated">
              <span className="status-dot online"></span>
              Session Active
            </div>
          )}
        </div>
      </header>

      <main className="demo-container">
        {mediaList.length === 0 ? (
          <div className="loading-placeholder">
            <p>Loading media...</p>
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
        mediaTitle={currentMediaId ? mediaList.find(m => m.id === currentMediaId)?.title : undefined}
        mediaPreviewUrl={currentMediaId ? mediaList.find(m => m.id === currentMediaId)?.previewUrl : undefined}
        mediaType={currentMediaType}
      />
    </div>
  )
}

export default App