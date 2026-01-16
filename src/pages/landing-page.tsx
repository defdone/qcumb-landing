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
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false)

  const scrollToTop = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    // Remove hash from URL if present
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
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

  const scrollToSection = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Remove hash from URL
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

  // Detect mobile/tablet on mount and resize
  useEffect(() => {
    const checkIsMobileOrTablet = () => {
      setIsMobileOrTablet(window.innerWidth <= 1024)
    }
    
    checkIsMobileOrTablet()
    window.addEventListener('resize', checkIsMobileOrTablet)
    
    return () => {
      window.removeEventListener('resize', checkIsMobileOrTablet)
    }
  }, [])

  useEffect(() => {
    // Check if steps section is fully visible using Intersection Observer
    // Skip this for mobile/tablet - they use simple sequential animation
    if (isMobileOrTablet) return
    
    const stepsSection = document.getElementById('how-it-works')
    if (stepsSection) {
      stepsSectionRef.current = stepsSection
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const rect = entry.boundingClientRect
            const viewportHeight = window.innerHeight
            
            // Check if section is in the top portion of viewport
            // For MacBook Pro (1440px or less), use smaller threshold to activate earlier
            // For 4K screens (>= 2000px), use larger threshold to account for increased padding
            const topThreshold = viewportHeight <= 1440 ? 0.1 : viewportHeight > 2000 ? 0.3 : 0.2
            const isAtTop = rect.top <= viewportHeight * topThreshold
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
  }, [isStepsComplete, isMobileOrTablet])

  useEffect(() => {
    // Block page scroll when section is visible and animation is not complete
    // Skip for mobile/tablet - they don't use scroll blocking
    if (isMobileOrTablet) return
    
    if (isSectionFullyVisible && !isStepsComplete) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isSectionFullyVisible, isStepsComplete, isMobileOrTablet])

  // Simple sequential animation for mobile/tablet - no scroll blocking
  useEffect(() => {
    if (!isMobileOrTablet) return
    
    const stepsSection = document.getElementById('how-it-works')
    if (!stepsSection) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
            // Section is visible - start sequential animation
            const allElements = Array.from(document.querySelectorAll('.landing-step, .landing-step-connector'))
            
            allElements.forEach((element, index) => {
              setTimeout(() => {
                element.classList.add('animate-in')
              }, index * 300) // 300ms delay between each element
            })
            
            // Mark as complete after all animations
            setTimeout(() => {
              setIsStepsComplete(true)
            }, allElements.length * 300)
            
            observer.disconnect()
          }
        })
      },
      {
        threshold: [0, 0.2, 0.5],
        rootMargin: '0px'
      }
    )
    
    observer.observe(stepsSection)
    
    return () => {
      observer.disconnect()
    }
  }, [isMobileOrTablet])

  useEffect(() => {
    // Skip scroll-based animation for mobile/tablet
    if (isMobileOrTablet) return
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
      
      // For MacBook Pro (1440px or less), use smaller threshold to activate earlier
      // This ensures the section is fully visible before animation starts
      // For 4K screens (>= 2000px), use larger threshold to account for increased padding
      const topThreshold = viewportHeight <= 1440 ? 0.1 : viewportHeight > 2000 ? 0.3 : 0.2
      const isAtTop = rect.top <= viewportHeight * topThreshold
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
      
      // For MacBook Pro (1440px or less), use smaller threshold to activate earlier
      // For 4K screens (>= 2000px), use larger threshold to account for increased padding
      const topThreshold = viewportHeight <= 1440 ? 0.1 : viewportHeight > 2000 ? 0.3 : 0.2
      const isAtTop = rect.top <= viewportHeight * topThreshold
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
  }, [isStepsComplete, isSectionFullyVisible, isMobileOrTablet])

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
            <img 
              src="/logoQC - base - H.png" 
              alt="qcumb" 
              className="landing-logo-img"
            />
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
                Premium media access powered by <span className="landing-gradient-text">wallet authentication</span>
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
                <a 
                  href="#how-it-works" 
                  className="landing-cta-secondary"
                  onClick={(e) => scrollToSection('how-it-works', e)}
                >
                  Learn more
                </a>
              </div>
              <div className="landing-hero-badges">
                <span className="landing-badge">
                  <span className="landing-badge-dot"></span>
                  Accountless access
                </span>
                <span className="landing-badge">
                  <span className="landing-badge-dot"></span>
                  Time-limited entitlements
                </span>
                <span className="landing-badge">
                  <span className="landing-badge-dot"></span>
                  Gasless USDC payments
                </span>
                <span className="landing-badge">
                  <span className="landing-badge-dot"></span>
                  Server-side enforcement
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
                      <div className="landing-mockup-browser-url">qcumb.com/app</div>
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
                <div className="landing-stat-number">Accountless</div>
                <div className="landing-stat-label">Onboarding that converts</div>
              </div>
              <div className="landing-stat">
                <div className="landing-stat-number">Time-limited</div>
                <div className="landing-stat-label">Clear, enforceable entitlements</div>
              </div>
              <div className="landing-stat">
                <div className="landing-stat-number">Gasless</div>
                <div className="landing-stat-label">Faster checkout flows</div>
              </div>
              <div className="landing-stat">
                <div className="landing-stat-number">Secure</div>
                <div className="landing-stat-label">Server is source of truth</div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="landing-section landing-section-problem landing-section-alt" id="problem">
          <div className="landing-section-inner">
            <div className="landing-section-header landing-section-header-left landing-animate">
              <div className="landing-kicker">Problem</div>
              <h2 className="landing-section-title">Paid content still leaks revenue</h2>
              <p className="landing-section-subtitle">
                Users drop off when asked to create accounts, payments add friction, and access control is often client-side. 
                The result is low conversion and high churn.
              </p>
            </div>
            <div className="landing-split">
              <div className="landing-panel landing-animate">
                <h3 className="landing-panel-title">Friction kills conversion</h3>
                <p className="landing-panel-text">
                  Account creation, passwords, and multi-step checkout slow users down. Every extra step reduces paid conversion.
                </p>
              </div>
              <div className="landing-panel landing-animate">
                <h3 className="landing-panel-title">Weak access control</h3>
                <p className="landing-panel-text">
                  Client-side gating and short-lived sessions leak premium content. Creators need server-side enforcement.
                </p>
              </div>
              <div className="landing-panel landing-animate">
                <h3 className="landing-panel-title">Payments feel expensive</h3>
                <p className="landing-panel-text">
                  Users abandon checkout when gas fees and complex flows appear. The experience must be as simple as one tap.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section" id="how-it-works" ref={stepsSectionRef}>
          <div className="landing-section-inner">
            <div className="landing-section-header landing-animate">
              <h2 className="landing-section-title">How it works</h2>
              <p className="landing-section-subtitle">
                A four-step flow that turns anonymous visitors into paid access
              </p>
            </div>
            <div className="landing-steps">
              <div className="landing-step" data-step="1">
                <div className="landing-step-icon">01</div>
                <h3 className="landing-step-title">Connect wallet</h3>
                <p className="landing-step-description">
                  Wallet is the identity. No email, password, or account creation. One click to start a session.
                </p>
              </div>
              <div className="landing-step-connector" data-connector="1"></div>
              <div className="landing-step" data-step="2">
                <div className="landing-step-icon">02</div>
                <h3 className="landing-step-title">Session verification</h3>
                <p className="landing-step-description">
                  Backend verifies the session and returns entitlements instantly. Server is the source of truth.
                </p>
              </div>
              <div className="landing-step-connector" data-connector="2"></div>
              <div className="landing-step" data-step="3">
                <div className="landing-step-icon">03</div>
                <h3 className="landing-step-title">Purchase access</h3>
                <p className="landing-step-description">
                  User selects a plan and signs a gasless USDC authorization. The backend executes payment.
                </p>
              </div>
              <div className="landing-step-connector" data-connector="3"></div>
              <div className="landing-step" data-step="4">
                <div className="landing-step-icon">04</div>
                <h3 className="landing-step-title">Access content</h3>
                <p className="landing-step-description">
                  Access is granted instantly and expires automatically. Clear, predictable access windows.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section landing-section-benefits" id="benefits">
          <div className="landing-section-inner">
            <div className="landing-section-header landing-animate">
              <h2 className="landing-section-title">Why qcumb wins</h2>
              <p className="landing-section-subtitle">
                Revenue-first infrastructure with enterprise-grade control
              </p>
            </div>
            <div className="landing-benefits">
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <BackendControlInfographic />
                </div>
                <h3 className="landing-benefit-title">Server-side enforcement</h3>
                <p className="landing-benefit-description">
                  Access is enforced on the backend, reducing leakage and making entitlements reliable for paid content.
                </p>
              </div>
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <TimeLimitInfographic />
                </div>
                <h3 className="landing-benefit-title">Time-limited access</h3>
                <p className="landing-benefit-description">
                  Clear access windows improve conversion and reduce refunds. Expiry is automatic and transparent.
                </p>
              </div>
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <OptimizedAPIInfographic />
                </div>
                <h3 className="landing-benefit-title">Scalable API design</h3>
                <p className="landing-benefit-description">
                  Efficient session and media fetching reduces cost and supports high-concurrency usage.
                </p>
              </div>
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <PaymentFlowInfographic />
                </div>
                <h3 className="landing-benefit-title">Frictionless payments</h3>
                <p className="landing-benefit-description">
                  Gasless USDC flows remove payment friction and improve checkout conversion for premium content.
                </p>
              </div>
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <WalletAuthInfographic />
                </div>
                <h3 className="landing-benefit-title">Accountless onboarding</h3>
                <p className="landing-benefit-description">
                  Wallet-based identity means fewer steps, fewer passwords, and higher completion rates.
                </p>
              </div>
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <ProductionReadyInfographic />
                </div>
                <h3 className="landing-benefit-title">Enterprise-ready core</h3>
                <p className="landing-benefit-description">
                  Robust session management, rate limiting, and error handling allow fast enterprise adoption.
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

        <section className="landing-section landing-section-creators landing-section-alt" id="model">
          <div className="landing-section-inner">
            <div className="landing-section-header landing-animate">
              <h2 className="landing-section-title">Business model</h2>
              <p className="landing-section-subtitle">
                Multiple revenue streams across creators, platforms, and enterprise
              </p>
            </div>
            <div className="landing-benefits">
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <DecentralizedStorageInfographic />
                </div>
                <h3 className="landing-benefit-title">Transaction take rate</h3>
                <p className="landing-benefit-description">
                  Percentage-based fee on premium access purchases. Scales with creator revenue and platform growth.
                </p>
              </div>
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <ContentProtectionInfographic />
                </div>
                <h3 className="landing-benefit-title">Creator tools subscription</h3>
                <p className="landing-benefit-description">
                  Premium tooling for content protection, analytics, and audience management.
                </p>
              </div>
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <WatermarkInfographic />
                </div>
                <h3 className="landing-benefit-title">Enterprise licensing</h3>
                <p className="landing-benefit-description">
                  White-label and API licensing for platforms that need secure access gating and payments.
                </p>
              </div>
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <TransparentRevenueInfographic />
                </div>
                <h3 className="landing-benefit-title">Clear revenue share</h3>
                <p className="landing-benefit-description">
                  Transparent split and automated payouts keep creator trust high.
                </p>
              </div>
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <CreatorRegistrationInfographic />
                </div>
                <h3 className="landing-benefit-title">Fast onboarding</h3>
                <p className="landing-benefit-description">
                  Wallet-first registration removes friction and accelerates creator acquisition.
                </p>
              </div>
              <div className="landing-benefit landing-animate">
                <div className="landing-benefit-icon">
                  <Web3MonetizationInfographic />
                </div>
                <h3 className="landing-benefit-title">Programmable payments</h3>
                <p className="landing-benefit-description">
                  On-chain payments allow flexible pricing, bundles, and time-based access models.
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

        <section className="landing-section landing-section-features" id="traction">
          <div className="landing-section-inner">
            <div className="landing-section-header landing-animate">
              <h2 className="landing-section-title">Traction & readiness</h2>
              <p className="landing-section-subtitle">
                Product foundation built for pilots and scaled launches
              </p>
            </div>
            <div className="landing-features">
              <div className="landing-feature landing-animate">
                <h3 className="landing-feature-title">Live product demo</h3>
                <p className="landing-feature-description">
                  Full payment flow, gated content, and entitlement handling are already implemented.
                </p>
              </div>
              <div className="landing-feature landing-animate">
                <h3 className="landing-feature-title">Payment rails integrated</h3>
                <p className="landing-feature-description">
                  Gasless USDC payments with server-side execution and transparent access windows.
                </p>
              </div>
              <div className="landing-feature landing-animate">
                <h3 className="landing-feature-title">Secure access layer</h3>
                <p className="landing-feature-description">
                  Server-enforced access control and session verification keep content protected.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section landing-section-demo landing-section-alt" id="go-to-market">
          <div className="landing-section-inner">
            <div className="landing-section-header landing-animate">
              <h2 className="landing-section-title">Go-to-market</h2>
              <p className="landing-section-subtitle">
                Focused on high-intent segments with clear revenue mechanics
              </p>
            </div>
            <div className="landing-demo-content landing-animate">
              <div className="landing-demo-text">
                <h3 className="landing-demo-title">Distribution strategy</h3>
                <p className="landing-demo-description">
                  Start with premium creators and platforms that already sell exclusive content. 
                  Expand into enterprise licensing for content publishers and media platforms.
                </p>
                <ul className="landing-demo-features">
                  <li>Creator partnerships for early traction</li>
                  <li>Platform integrations with revenue share</li>
                  <li>Enterprise licensing for content publishers</li>
                  <li>Composable APIs for developers</li>
                </ul>
                <div className="landing-demo-connect">
                  <button
                    className="landing-cta-primary"
                    onClick={() => navigate('/app')}
                  >
                    View product demo
                  </button>
                </div>
              </div>
              <div className="landing-demo-visual">
                <div className="landing-demo-card">
                  <div className="landing-demo-card-header">
                    <div className="landing-demo-card-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <div className="landing-demo-card-title">Media Library</div>
                  </div>
                  <div className="landing-demo-card-content">
                    <div className="landing-demo-preview-grid">
                      <div className="landing-demo-preview-item">
                        <div className="landing-demo-preview-placeholder"></div>
                        <div className="landing-demo-preview-badge locked">Locked</div>
                      </div>
                      <div className="landing-demo-preview-item">
                        <div className="landing-demo-preview-placeholder"></div>
                        <div className="landing-demo-preview-badge unlocked">Unlocked</div>
                      </div>
                      <div className="landing-demo-preview-item">
                        <div className="landing-demo-preview-placeholder"></div>
                        <div className="landing-demo-preview-badge locked">Locked</div>
                      </div>
                    </div>
                  </div>
                </div>
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
                <h3 className="landing-faq-question">How does qcumb make money?</h3>
                <p className="landing-faq-answer">
                  Revenue comes from transaction fees, creator subscriptions, and enterprise/API licensing.
                </p>
              </div>
              <div className="landing-faq-item landing-animate">
                <h3 className="landing-faq-question">What is the key moat?</h3>
                <p className="landing-faq-answer">
                  A combination of low-friction checkout, server-enforced access control, and programmable payments.
                </p>
              </div>
              <div className="landing-faq-item landing-animate">
                <h3 className="landing-faq-question">Who is the target customer?</h3>
                <p className="landing-faq-answer">
                  Premium creators, content platforms, and publishers that need secure access and monetization.
                </p>
              </div>
              <div className="landing-faq-item landing-animate">
                <h3 className="landing-faq-question">How do you scale distribution?</h3>
                <p className="landing-faq-answer">
                  Partnerships with creators and platforms, followed by enterprise licensing and developer integrations.
                </p>
              </div>
              <div className="landing-faq-item landing-animate">
                <h3 className="landing-faq-question">What is the next milestone?</h3>
                <p className="landing-faq-answer">
                  Move from demo to pilot programs with paying creators and platform partners.
                </p>
              </div>
              <div className="landing-faq-item landing-animate">
                <h3 className="landing-faq-question">What are the main risks?</h3>
                <p className="landing-faq-answer">
                  Market adoption and regulatory changes. The platform is designed to adapt with compliance requirements.
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
                Monetize premium content with <span className="landing-footer-accent">qcumb</span>.
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
                Copyright Defdone 2025
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
                  <div>Defdone</div>
                  <div>Floriana Stablewskiego 43/4</div>
                  <div>60-213 Poznan, Poland</div>
                </div>
              </div>
            </div>

            <div className="landing-footer-col landing-footer-links">
              <h3 className="landing-footer-heading">More</h3>
              <nav className="landing-footer-nav">
                <a href="#how-it-works" onClick={(e) => scrollToSection('how-it-works', e)}>How it works</a>
                <a href="#benefits" onClick={(e) => scrollToSection('benefits', e)}>Why qcumb</a>
                <a href="#creators" onClick={(e) => scrollToSection('creators', e)}>For creators</a>
                <a href="#features" onClick={(e) => scrollToSection('features', e)}>Features</a>
                <a href="#demo" onClick={(e) => scrollToSection('demo', e)}>Demo</a>
                <a href="#faq" onClick={(e) => scrollToSection('faq', e)}>FAQ</a>
              </nav>
            </div>
          </div>
          <div className="landing-footer-disclaimer">
            <p className="landing-footer-disclaimer-text">
              This is a test/demo website. We are not responsible for any losses, damages, or issues that may arise from using this service. 
              Use at your own risk. This demo runs on testnet and is for demonstration purposes only.
            </p>
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
