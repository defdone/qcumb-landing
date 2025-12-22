import { useState, useEffect } from 'react'
import VideoPlayer from './components/video-player'
import ImageViewer from './components/image-viewer'
import PaymentModal from './components/payment-modal'
import WalletConnect from './components/wallet-connect'
import { useX402Payment } from './hooks/use-x402-payment'
import { formatUsdcAmount, API_URL } from './config/x402-config'
import './App.css'

interface UnlockedContent {
  video: string | null  // mediaUrl or null
  image: string | null  // mediaUrl or null
}

// Load unlocked content from sessionStorage (per wallet address)
const loadUnlockedContent = (walletAddress: string | null): UnlockedContent => {
  if (!walletAddress) return { video: null, image: null }
  
  try {
    const key = `x402_unlocked_${walletAddress.toLowerCase()}`
    const saved = sessionStorage.getItem(key)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch {
    // Ignore parse errors
  }
  return { video: null, image: null }
}

// Save unlocked content to sessionStorage (per wallet address)
const saveUnlockedContent = (walletAddress: string | null, content: UnlockedContent) => {
  if (!walletAddress) return
  
  const key = `x402_unlocked_${walletAddress.toLowerCase()}`
  sessionStorage.setItem(key, JSON.stringify(content))
}

function App() {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [currentMediaType, setCurrentMediaType] = useState<'video' | 'image' | null>(null)
  const [unlockedContent, setUnlockedContent] = useState<UnlockedContent>({ video: null, image: null })
  const [prices, setPrices] = useState<{ video: string; image: string }>({ video: '10000', image: '10000' })
  const [serverStatus, setServerStatus] = useState<{
    online: boolean | null
    network: string | null
  }>({ online: null, network: null })
  const [mediaKey, setMediaKey] = useState(0) // Key to force re-render media components

  const {
    paymentStatus,
    paymentRequirements,
    walletAddress,
    mediaUrl,
    transactionHash,
    error,
    connectWallet,
    disconnectWallet,
    requestPayment,
    executePayment,
    resetPayment
  } = useX402Payment()

  // Load unlocked content when wallet changes
  useEffect(() => {
    setUnlockedContent(loadUnlockedContent(walletAddress))
  }, [walletAddress])

  // Check server status
  useEffect(() => {
    let wasOffline = serverStatus.online === false || serverStatus.online === null

    const checkServer = async () => {
      try {
        const response = await fetch(`${API_URL}/health`, { 
          method: 'GET',
          signal: AbortSignal.timeout(3000)
        })
        if (response.ok) {
          const data = await response.json()
          const network = data?.payment?.network || data?.network || null
          
          // If server just came online, refresh media components
          if (wasOffline) {
            setMediaKey(prev => prev + 1)
          }
          
          setServerStatus({ online: true, network })
          wasOffline = false
        } else {
          setServerStatus({ online: false, network: null })
          wasOffline = true
        }
      } catch {
        setServerStatus({ online: false, network: null })
        wasOffline = true
      }
    }

    checkServer()
    const interval = setInterval(checkServer, 5000)
    return () => clearInterval(interval)
  }, [])

  // Handle successful payment - save unlocked content but don't auto-close modal
  useEffect(() => {
    if (paymentStatus === 'success' && currentMediaType && mediaUrl) {
      setUnlockedContent(prev => {
        const newState = { ...prev, [currentMediaType]: mediaUrl }
        saveUnlockedContent(walletAddress, newState)
        return newState
      })
      // Modal stays open - user closes it manually with X or Continue button
    }
  }, [paymentStatus, currentMediaType, mediaUrl, walletAddress])

  // Update prices when payment requirements come in
  useEffect(() => {
    if (paymentRequirements && currentMediaType) {
      setPrices(prev => ({
        ...prev,
        [currentMediaType]: paymentRequirements.amount
      }))
    }
  }, [paymentRequirements, currentMediaType])

  const handlePaymentRequest = async (mediaType: 'video' | 'image') => {
    setCurrentMediaType(mediaType)
    
    if (!walletAddress) {
      await connectWallet()
    }

    await requestPayment(mediaType)
    setShowPaymentModal(true)
  }

  const handlePaymentExecute = async () => {
    await executePayment()
  }

  const handlePaymentCancel = () => {
    setShowPaymentModal(false)
    setCurrentMediaType(null)
    resetPayment()
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <h1>x402 Payment Demo</h1>
          <WalletConnect
            walletAddress={walletAddress}
            onConnect={connectWallet}
            onDisconnect={disconnectWallet}
            isConnecting={paymentStatus === 'connecting'}
          />
        </div>
        <p className="description">
          Demo x402 protocol with USDC payments on Base Sepolia.
          Click on locked media to pay {formatUsdcAmount(prices.video)} USDC.
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
        </div>
      </header>

      <main className="demo-container">
        <div className="media-section">
          <h2>Video</h2>
          <p className="price-tag">{formatUsdcAmount(prices.video)} USDC</p>
          <VideoPlayer
            key={`video-${mediaKey}`}
            isLocked={!unlockedContent.video}
            onPaymentRequest={() => handlePaymentRequest('video')}
            mediaUrl={unlockedContent.video}
            serverOnline={serverStatus.online}
          />
        </div>

        <div className="media-section">
          <h2>Image</h2>
          <p className="price-tag">{formatUsdcAmount(prices.image)} USDC</p>
          <ImageViewer
            key={`image-${mediaKey}`}
            isLocked={!unlockedContent.image}
            onPaymentRequest={() => handlePaymentRequest('image')}
            mediaUrl={unlockedContent.image}
            serverOnline={serverStatus.online}
          />
        </div>
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
        onConnectWallet={connectWallet}
      />
    </div>
  )
}

export default App