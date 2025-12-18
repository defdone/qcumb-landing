import { useState, useEffect } from 'react'
import VideoPlayer from './components/video-player'
import ImageViewer from './components/image-viewer'
import PaymentModal from './components/payment-modal'
import WalletConnect from './components/wallet-connect'
import { useX402Payment } from './hooks/use-x402-payment'
import { X402_CONFIG, formatUsdcAmount, getCurrentNetwork } from './config/x402-config'
import './App.css'

interface UnlockedContent {
  video: boolean
  image: boolean
}

// Load unlocked content from sessionStorage (per wallet address)
const loadUnlockedContent = (walletAddress: string | null): UnlockedContent => {
  if (!walletAddress) return { video: false, image: false }
  
  try {
    const key = `x402_unlocked_${walletAddress.toLowerCase()}`
    const saved = sessionStorage.getItem(key)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch {
    // Ignore parse errors
  }
  return { video: false, image: false }
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
  const [unlockedContent, setUnlockedContent] = useState<UnlockedContent>({ video: false, image: false })

  const {
    paymentStatus,
    paymentRequest,
    walletAddress,
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

  const handlePaymentRequest = async (mediaType: 'video' | 'image') => {
    setCurrentMediaType(mediaType)
    
    if (!walletAddress) {
      await connectWallet()
    }

    await requestPayment(mediaType, `/api/media/${mediaType}`)
    setShowPaymentModal(true)
  }

  const handlePaymentExecute = async () => {
    const success = await executePayment()
    
    if (success && currentMediaType) {
      setTimeout(() => {
        setUnlockedContent(prev => {
          const newState = {
            ...prev,
            [currentMediaType]: true
          }
          saveUnlockedContent(walletAddress, newState)
          return newState
        })
        setShowPaymentModal(false)
        resetPayment()
      }, 2000)
    }
  }

  const handlePaymentCancel = () => {
    setShowPaymentModal(false)
    setCurrentMediaType(null)
    resetPayment()
  }

  const network = getCurrentNetwork()

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
          Demo płatności x402 z USDC na sieci {network.name === 'base-sepolia' ? 'Base Sepolia' : 'Base'}.
          Kliknij na zablokowane media aby zapłacić {formatUsdcAmount(X402_CONFIG.prices.video)} USDC.
        </p>
        <div className="network-badge">
          <span className={`network-dot ${X402_CONFIG.useTestnet ? 'testnet' : 'mainnet'}`}></span>
          {X402_CONFIG.useTestnet ? 'Base Sepolia Testnet' : 'Base Mainnet'}
        </div>
      </header>

      <main className="demo-container">
        <div className="media-section">
          <h2>Video</h2>
          <p className="price-tag">{formatUsdcAmount(X402_CONFIG.prices.video)} USDC</p>
          <VideoPlayer
            isLocked={!unlockedContent.video}
            onPaymentRequest={() => handlePaymentRequest('video')}
          />
        </div>

        <div className="media-section">
          <h2>Image</h2>
          <p className="price-tag">{formatUsdcAmount(X402_CONFIG.prices.image)} USDC</p>
          <ImageViewer
            isLocked={!unlockedContent.image}
            onPaymentRequest={() => handlePaymentRequest('image')}
          />
        </div>
      </main>

      <PaymentModal
        show={showPaymentModal}
        paymentRequest={paymentRequest}
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