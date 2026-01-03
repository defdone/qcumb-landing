import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import WalletConnect from '../components/wallet-connect'
import {
  BackendControlInfographic,
  WalletAuthInfographic,
  DecentralizedStorageInfographic,
  ContentProtectionInfographic,
  WatermarkInfographic,
  PaymentFlowInfographic,
  TimeLimitInfographic,
  OptimizedAPIInfographic,
  ProductionReadyInfographic,
  TransparentRevenueInfographic,
  CreatorRegistrationInfographic,
  Web3MonetizationInfographic
} from '../components/infographics'
import './landing-page.css'

export default function LandingPage() {
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const [isStepsComplete, setIsStepsComplete] = useState(false)
  const [isSectionFullyVisible, setIsSectionFullyVisible] = useState(false)
  const stepsSectionRef = useRef<HTMLElement | null>(null)
  const currentStepIndexRef = useRef(0)

  const scrollToTop = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    // Primary method: scroll to top element
    const topElement = document.getElementById('landing-top')
    if (topElement) {
      topElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    
    // Fallback: scroll window to top
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    } else {
      // Fallback for browsers without smooth scroll support
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
  }

  useEffect(() => {
    // Add class to body for full-width styling
    document.body.classList.add('landing-mode')
    
    if (isConnected) {
      navigate('/app', { replace: true })
    }
    
    return () => {
      document.body.classList.remove('landing-mode')
    }
  }, [isConnected, navigate])

  useEffect(() => {
    // Check if steps section is fully visible using Intersection Observer
    const stepsSection = document.getElementById('how-it-works')
    if (stepsSection) {
      stepsSectionRef.current = stepsSection
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const rect = entry.boundingClientRect
            const viewportHeight = window.innerHeight
            
            // Check if section is in the top portion of viewport
            // Use 20% of viewport height to activate scroll blocking
            // This ensures page blocks before user scrolls too far down
            const isAtTop = rect.top <= viewportHeight * 0.2
            // Lower threshold for visibility - just needs to be entering viewport
            // On 4K screens, section might be visible but not 70% of viewport
            const minVisibility = viewportHeight > 2000 ? 0.1 : 0.3
            const isMostlyVisible = entry.intersectionRatio >= minVisibility
            
            // Section is "fully visible" when it's at the top and mostly visible
            // This works regardless of screen size
            const isFullyVisible = isAtTop && isMostlyVisible
            
            setIsSectionFullyVisible(isFullyVisible)
          })
        },
        {
          threshold: [0, 0.3, 0.5, 0.7, 0.85, 0.9, 0.95, 1.0],
          rootMargin: '0px'
        }
      )
      
      observer.observe(stepsSection)
      
      return () => {
        observer.disconnect()
      }
    }
  }, [isStepsComplete])

  useEffect(() => {
    // Block page scroll when section is visible and animation is not complete
    if (isSectionFullyVisible && !isStepsComplete) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isSectionFullyVisible, isStepsComplete])

  useEffect(() => {
    if (isStepsComplete || !isSectionFullyVisible) return

    let lastWheelTime = 0
    let hasStartedAnimation = false
    let scrollBlocked = false
    let scrollTimeout: NodeJS.Timeout | null = null

    const handleWheel = (e: WheelEvent) => {
      if (isStepsComplete) return
      if (!isSectionFullyVisible) return
      
      const stepsSection = stepsSectionRef.current
      if (!stepsSection) return

      // Check if section is still in viewport and at the top
      const rect = stepsSection.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      
      // Use 20% of viewport height to activate scroll blocking
      const isAtTop = rect.top <= viewportHeight * 0.2
      // Bottom should be visible - adjust threshold for larger screens
      const bottomThreshold = viewportHeight > 2000 ? 0.05 : 0.15
      const isBottomVisible = rect.bottom > viewportHeight * bottomThreshold
      const isInViewport = isAtTop && isBottomVisible

      if (!isInViewport) {
        scrollBlocked = false
        return
      }

      // If section is in viewport, always block scroll down to prevent skipping
      if (e.deltaY > 0) {
        e.preventDefault()
        e.stopPropagation()
        scrollBlocked = true
        
        // Debounce wheel events - longer delay for smaller screens (MacBook)
        // MacBook typically has viewport height around 1440px or less
        const debounceDelay = viewportHeight <= 1440 ? 200 : 400
        const now = Date.now()
        if (now - lastWheelTime < debounceDelay) {
          return
        }
        lastWheelTime = now

        const allElements = Array.from(document.querySelectorAll('.landing-step, .landing-step-connector'))
        const animatedCount = allElements.filter(el => el.classList.contains('animate-in')).length
        const totalCount = allElements.length

        // Check if we can animate next element
        if (animatedCount < totalCount) {
          const nextElement = allElements[animatedCount]
          if (nextElement && !nextElement.classList.contains('animate-in')) {
            hasStartedAnimation = true
            const previousElement = animatedCount > 0 ? allElements[animatedCount - 1] : null
            if (animatedCount === 0 || (previousElement && previousElement.classList.contains('animate-in'))) {
              nextElement.classList.add('animate-in')
              currentStepIndexRef.current = animatedCount + 1
            }
          }
        } else {
          // All elements animated - allow normal scroll
          setIsStepsComplete(true)
          scrollBlocked = false
        }
      } else if (e.deltaY < 0 && !hasStartedAnimation) {
        // Allow scrolling up before animation starts
        scrollBlocked = false
        return
      } else if (e.deltaY < 0 && hasStartedAnimation) {
        // Block scrolling up once animation has started
        e.preventDefault()
        e.stopPropagation()
      }
    }

    // Also handle scroll event to catch fast scrolling
    const handleScroll = () => {
      if (isStepsComplete || !isSectionFullyVisible) return
      
      const stepsSection = stepsSectionRef.current
      if (!stepsSection) return

      const rect = stepsSection.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      
      // Use 20% of viewport height to activate scroll blocking
      const isAtTop = rect.top <= viewportHeight * 0.2
      // Adjust threshold for larger screens
      const bottomThreshold = viewportHeight > 2000 ? 0.05 : 0.15
      const isBottomVisible = rect.bottom > viewportHeight * bottomThreshold
      const isInViewport = isAtTop && isBottomVisible

      if (isInViewport && scrollBlocked) {
        // Debounce scroll correction to prevent bouncing
        if (scrollTimeout) {
          clearTimeout(scrollTimeout)
        }
        
        scrollTimeout = setTimeout(() => {
          // Only correct scroll if section is still at the top and scroll is blocked
          const currentRect = stepsSection.getBoundingClientRect()
          const currentIsAtTop = currentRect.top <= 150
          const currentIsBottomVisible = currentRect.bottom > window.innerHeight * 0.3
          const currentIsInViewport = currentIsAtTop && currentIsBottomVisible
          
          if (currentIsInViewport && scrollBlocked && !isStepsComplete) {
            window.scrollTo({
              top: stepsSection.offsetTop,
              behavior: 'smooth'
            })
          }
        }, 100)
      }
    }

    // Add wheel listener to window for better compatibility
    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('scroll', handleScroll, { passive: false })

    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isStepsComplete, isSectionFullyVisible])

  useEffect(() => {
    // Intersection Observer for scroll animations - but NOT for steps/connectors
    // Steps/connectors are animated only by wheel event
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target
            const isStep = element.classList.contains('landing-step')
            const isConnector = element.classList.contains('landing-step-connector')
            
            // Skip steps and connectors - they are animated by wheel event only
            if (isStep || isConnector) {
              return
            }
            
            // Other elements (not steps/connectors) - animate normally
            element.classList.add('animate-in')
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -80px 0px' }
    )

    // Only observe elements that are NOT steps or connectors
    const elements = document.querySelectorAll('.landing-animate')
    elements.forEach((el) => {
      const isStep = el.classList.contains('landing-step')
      const isConnector = el.classList.contains('landing-step-connector')
      if (!isStep && !isConnector) {
        observerRef.current?.observe(el)
      }
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])


  return (
    <div id="landing-top" className="landing-page landing-dark">
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo-wrapper" onClick={scrollToTop}>
            <div className="landing-logo">Defdone</div>
            <span className="landing-logo-badge">web3</span>
          </div>
          <div className="landing-nav-actions">
            <WalletConnect
              walletAddress={address ?? null}
              onConnect={() => {}}
              onDisconnect={() => {}}
              isConnecting={false}
            />
          </div>
        </div>
      </nav>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-bg"></div>
          <div className="landing-hero-content">
            <div className="landing-hero-text landing-animate">
              <div className="landing-hero-label">Wallet Authentication</div>
              <h1 className="landing-hero-title">
                Premium media access powered by <span className="landing-gradient-text">x402 protocol</span>
              </h1>
              <p className="landing-hero-description">
                Connect your wallet to start a session. Purchase time-limited access to content with USDC payments. No accounts, no passwords—just your wallet.
              </p>
              <div className="landing-hero-cta">
                {isConnected ? (
                  <button
                    className="landing-cta-primary"
                    onClick={() => navigate('/app')}
                  >
                    Enter app
                  </button>
                ) : (
                  <div className="landing-hero-connect-wrapper">
                    <ConnectKitButton.Custom>
                      {({ show }) => (
                        <button
                          className="landing-cta-primary"
                          onClick={show}
                        >
                          Connect wallet to start
                        </button>
                      )}
                    </ConnectKitButton.Custom>
                  </div>
                )}
                <a href="#how-it-works" className="landing-cta-secondary">
                  Learn more
                </a>
              </div>
              <div className="landing-hero-badges">
                <span className="landing-badge">
                  <span className="landing-badge-dot"></span>
                  Base Sepolia
                </span>
                <span className="landing-badge">
                  <span className="landing-badge-dot"></span>
                  USDC Payments
                </span>
                <span className="landing-badge">
                  <span className="landing-badge-dot"></span>
                  EIP-3009
                </span>
                <span className="landing-badge">
                  <span className="landing-badge-dot"></span>
                  x402 Protocol
                </span>
              </div>
            </div>
            <div className="landing-hero-visual landing-animate">
              <div className="landing-mockup">
                <div className="landing-mockup-glow"></div>
                <div className="landing-mockup-header">
                  <div className="landing-mockup-browser-controls">
                    <div className="landing-mockup-browser-dots">
                      <span className="landing-mockup-dot landing-mockup-dot-close">
                        <span className="landing-mockup-dot-icon">×</span>
                      </span>
                      <span className="landing-mockup-dot landing-mockup-dot-minimize">
                        <span className="landing-mockup-dot-icon">−</span>
                      </span>
                      <span className="landing-mockup-dot landing-mockup-dot-maximize">
                        <span className="landing-mockup-dot-icon">⤢</span>
                      </span>
                    </div>
                    <div className="landing-mockup-browser-bar">
                      <div className="landing-mockup-browser-icons">
                        <span className="landing-mockup-browser-icon">←</span>
                        <span className="landing-mockup-browser-icon">→</span>
                        <span className="landing-mockup-browser-icon">↻</span>
                      </div>
                      <div className="landing-mockup-browser-url">defdone.com/app</div>
                      <div className="landing-mockup-browser-menu">⋮</div>
                    </div>
                  </div>
                </div>
                <div className="landing-mockup-content">
                  <div className="landing-mockup-card">
                    <div className="landing-mockup-card-preview">
                      <div className="landing-mockup-card-overlay"></div>
                    </div>
                    <div className="landing-mockup-card-info">
                      <div className="landing-mockup-card-title">Premium Video</div>
                      <div className="landing-mockup-card-status">Access granted</div>
                    </div>
                  </div>
                  <div className="landing-mockup-card">
                    <div className="landing-mockup-card-preview locked">
                      <div className="landing-mockup-card-overlay"></div>
                    </div>
                    <div className="landing-mockup-card-info">
                      <div className="landing-mockup-card-title">Premium Video</div>
                      <div className="landing-mockup-card-status locked">Locked</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section landing-section-stats">
          <div className="landing-section-inner">
            <div className="landing-stats landing-animate">
              <div className="landing-stat">
                <div className="landing-stat-number">Gasless</div>
                <div className="landing-stat-label">Payments</div>
              </div>
              <div className="landing-stat">
                <div className="landing-stat-number">Wallet-only</div>
                <div className="landing-stat-label">No accounts</div>
              </div>
              <div className="landing-stat">
                <div className="landing-stat-number">Server-side</div>
                <div className="landing-stat-label">Security</div>
              </div>
              <div className="landing-stat">
                <div className="landing-stat-number">Instant</div>
                <div className="landing-stat-label">Access</div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section" id="how-it-works" ref={stepsSectionRef}>
          <div className="landing-section-inner">
            <div className="landing-section-header landing-animate">
              <h2 className="landing-section-title">How it works</h2>
              <p className="landing-section-subtitle">
                A simple flow for wallet-based authentication and pay-per-access media
              </p>
            </div>
            <div className="landing-steps">
              <div className="landing-step" data-step="1">
                <div className="landing-step-icon">01</div>
                <h3 className="landing-step-title">Connect wallet</h3>
                <p className="landing-step-description">
                  Your wallet acts as your login. No email, password, or account creation required. Just connect and authenticate.
                </p>
              </div>
              <div className="landing-step-connector" data-connector="1"></div>
              <div className="landing-step" data-step="2">
                <div className="landing-step-icon">02</div>
                <h3 className="landing-step-title">Session verification</h3>
                <p className="landing-step-description">
                  Backend verifies your wallet session and returns your active entitlements automatically. Secure and instant.
                </p>
              </div>
              <div className="landing-step-connector" data-connector="2"></div>
              <div className="landing-step" data-step="3">
                <div className="landing-step-icon">03</div>
                <h3 className="landing-step-title">Purchase access</h3>
                <p className="landing-step-description">
                  Choose a plan (24h or 7d) and complete payment using USDC via EIP-3009 transfer authorization. Gasless transactions.
                </p>
              </div>
              <div className="landing-step-connector" data-connector="3"></div>
              <div className="landing-step" data-step="4">
                <div className="landing-step-icon">04</div>
                <h3 className="landing-step-title">Access content</h3>
                <p className="landing-step-description">
                  Access is granted immediately. Your entitlement expires based on the plan you selected. Transparent and reliable.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section landing-section-benefits" id="benefits">
          <div className="landing-section-inner">
            <div className="landing-section-header landing-animate">
              <h2 className="landing-section-title">Why defdone</h2>
              <p className="landing-section-subtitle">
                Built for production with a focus on reliability, security, and user experience
              </p>
            </div>
            <div className="landing-benefits">
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <BackendControlInfographic />
                </div>
                <h3 className="landing-benefit-title">Backend-driven access control</h3>
                <p className="landing-benefit-description">
                  The UI relies on the `hasAccess` flag returned by the API. No client-side access checks. Server is the source of truth.
                </p>
              </div>
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <TimeLimitInfographic />
                </div>
                <h3 className="landing-benefit-title">Time-limited entitlements</h3>
                <p className="landing-benefit-description">
                  Plans are scoped by duration (24h or 7d). Expiry timestamps are visible and enforced server-side. No surprises.
                </p>
              </div>
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <OptimizedAPIInfographic />
                </div>
                <h3 className="landing-benefit-title">Optimized API usage</h3>
                <p className="landing-benefit-description">
                  Debounced media fetching prevents rate limiting. Session state is managed efficiently. Built for scale.
                </p>
              </div>
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <PaymentFlowInfographic />
                </div>
                <h3 className="landing-benefit-title">Gasless payments</h3>
                <p className="landing-benefit-description">
                  EIP-3009 enables gasless USDC transfers. You sign once, backend executes. Lower costs, better UX.
                </p>
              </div>
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <WalletAuthInfographic />
                </div>
                <h3 className="landing-benefit-title">Wallet-first authentication</h3>
                <p className="landing-benefit-description">
                  No traditional accounts. Your wallet address is your identity. Simple, secure, and decentralized.
                </p>
              </div>
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <ProductionReadyInfographic />
                </div>
                <h3 className="landing-benefit-title">Production-ready</h3>
                <p className="landing-benefit-description">
                  Built with best practices. Error handling, session management, and rate limiting all included.
                </p>
              </div>
            </div>
            {/* 
              TODO: To display real statistics from backend, add endpoint:
              GET /api/stats
              
              Expected response:
              {
                "totalUsers": 1234,
                "totalPayments": 5678,
                "totalRevenue": "123.45", // USDC amount
                "activeSessions": 89,
                "totalMediaItems": 12,
                "averagePaymentTime": 2.3, // seconds
                "successRate": 99.8 // percentage
              }
              
              Then fetch and display in a stats section above or below benefits.
            */}
          </div>
        </section>

        <section className="landing-section landing-section-creators" id="creators">
          <div className="landing-section-inner">
            <div className="landing-section-header landing-animate">
              <h2 className="landing-section-title">For creators</h2>
              <p className="landing-section-subtitle">
                Monetize your content with enterprise-grade security and transparent revenue sharing
              </p>
            </div>
            <div className="landing-benefits">
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <DecentralizedStorageInfographic />
                </div>
                <h3 className="landing-benefit-title">Decentralized storage</h3>
                <p className="landing-benefit-description">
                  Your content is stored on decentralized storage networks. No single point of failure. Permanent, censorship-resistant, and truly yours.
                </p>
              </div>
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <ContentProtectionInfographic />
                </div>
                <h3 className="landing-benefit-title">Advanced content protection</h3>
                <p className="landing-benefit-description">
                  Media processors automatically blur and distort previews. Content never leaks. Server-side processing ensures your original files stay secure.
                </p>
              </div>
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <WatermarkInfographic />
                </div>
                <h3 className="landing-benefit-title">Watermark detection</h3>
                <p className="landing-benefit-description">
                  Invisible watermarks embedded in your content enable detection and tracking. Know where your content appears across the web.
                </p>
              </div>
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <TransparentRevenueInfographic />
                </div>
                <h3 className="landing-benefit-title">Transparent revenue</h3>
                <p className="landing-benefit-description">
                  Clear, upfront pricing for content access. You set the rates. Payments are processed automatically. No hidden fees, no surprises.
                </p>
              </div>
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <CreatorRegistrationInfographic />
                </div>
                <h3 className="landing-benefit-title">Creator registration</h3>
                <p className="landing-benefit-description">
                  Coming soon: Register as a creator with your wallet. Upload content, set pricing, and start earning. Simple onboarding, powerful tools.
                </p>
              </div>
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <Web3MonetizationInfographic />
                </div>
                <h3 className="landing-benefit-title">Web3-native monetization</h3>
                <p className="landing-benefit-description">
                  Built for the decentralized web. Wallet-based authentication, on-chain payments, and transparent revenue distribution. No intermediaries.
                </p>
              </div>
            </div>
            {/* 
              TODO: Creator registration endpoint (coming soon):
              POST /api/creators/register
              
              Expected request:
              {
                "walletAddress": "0x...",
                "signature": "0x...", // EIP-712 signature
                "metadata": {
                  "name": "Creator Name",
                  "bio": "Creator bio",
                  "website": "https://..."
                }
              }
              
              Expected response:
              {
                "success": true,
                "creatorId": "creator_...",
                "walletAddress": "0x...",
                "registeredAt": "2025-01-04T..."
              }
            */}
          </div>
        </section>

        <section className="landing-section landing-section-features" id="features">
          <div className="landing-section-inner">
            <div className="landing-section-header landing-animate">
              <h2 className="landing-section-title">Technical features</h2>
              <p className="landing-section-subtitle">
                Advanced capabilities that make this demo production-ready
              </p>
            </div>
            <div className="landing-features">
              <div className="landing-feature landing-animate">
                <h3 className="landing-feature-title">Session management</h3>
                <p className="landing-feature-description">
                  Secure wallet session tokens with server-side verification. Automatic refresh and expiry handling.
                </p>
              </div>
              <div className="landing-feature landing-animate">
                <h3 className="landing-feature-title">Entitlement tracking</h3>
                <p className="landing-feature-description">
                  Real-time entitlement status with expiry tracking. Automatic access revocation when expired.
                </p>
              </div>
              <div className="landing-feature landing-animate">
                <h3 className="landing-feature-title">Payment processing</h3>
                <p className="landing-feature-description">
                  EIP-3009 compliant payment flow. Signed authorization messages processed securely on the backend.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section landing-section-faq" id="faq">
          <div className="landing-section-inner">
            <div className="landing-section-header landing-animate">
              <h2 className="landing-section-title">Frequently asked questions</h2>
            </div>
            <div className="landing-faq">
              <div className="landing-faq-item landing-animate">
                <h3 className="landing-faq-question">Do I need to create an account?</h3>
                <p className="landing-faq-answer">
                  No. Your wallet address serves as your identity. Connect your wallet to authenticate. No email, password, or registration required.
                </p>
              </div>
              <div className="landing-faq-item landing-animate">
                <h3 className="landing-faq-question">What network is supported?</h3>
                <p className="landing-faq-answer">
                  This demo runs on Base Sepolia testnet. Payments use USDC on Base Sepolia. Mainnet support can be added easily.
                </p>
              </div>
              <div className="landing-faq-item landing-animate">
                <h3 className="landing-faq-question">How does payment work?</h3>
                <p className="landing-faq-answer">
                  Payments use EIP-3009 (TransferWithAuthorization) for gasless USDC transfers. You sign an authorization message, and the backend executes the transfer. No gas fees for you.
                </p>
              </div>
              <div className="landing-faq-item landing-animate">
                <h3 className="landing-faq-question">What happens when my access expires?</h3>
                <p className="landing-faq-answer">
                  When your entitlement expires, you'll need to purchase access again to view the content. The UI will show locked content and a purchase option. Expiry is clearly displayed.
                </p>
              </div>
              <div className="landing-faq-item landing-animate">
                <h3 className="landing-faq-question">Is my wallet data stored?</h3>
                <p className="landing-faq-answer">
                  Only your wallet address and session tokens are stored server-side for authentication. No private keys or personal data is ever stored or transmitted.
                </p>
              </div>
              <div className="landing-faq-item landing-animate">
                <h3 className="landing-faq-question">Can I use this in production?</h3>
                <p className="landing-faq-answer">
                  This is a production-ready demo. All core features are implemented: session management, payment processing, access control, and error handling. Ready to deploy.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-content">
            <div className="landing-footer-col landing-footer-brand">
              <div className="landing-footer-slogan">
                Consider <span className="landing-footer-accent">IT</span> done.
              </div>
              <div className="landing-footer-social">
                <a href="https://linkedin.com/company/defdone" className="landing-footer-social-link" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="https://defdone.com" className="landing-footer-social-link" aria-label="Website" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </a>
              </div>
              <div className="landing-footer-copyright">
                Copyright defdone 2025
              </div>
            </div>

            <div className="landing-footer-col landing-footer-contact">
              <h3 className="landing-footer-heading">Get in touch</h3>
              <div className="landing-footer-contact-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <a href="mailto:hello@defdone.com">hello@defdone.com</a>
              </div>
              <div className="landing-footer-contact-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <div>
                  <div>Defdone Sp. z o.o.</div>
                  <div>Floriana Stablewskiego 43/4</div>
                  <div>60-213 Poznan, Poland</div>
                </div>
              </div>
            </div>

            <div className="landing-footer-col landing-footer-links">
              <h3 className="landing-footer-heading">More</h3>
              <nav className="landing-footer-nav">
                <a href="#how-it-works">How it works</a>
                <a href="#features">Features</a>
                <a href="#benefits">Why defdone</a>
                <a href="#creators">For creators</a>
                <a href="#faq">FAQ</a>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/app'); }}>Demo</a>
              </nav>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      <button
        className="landing-scroll-top"
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
    </div>
  )
}
