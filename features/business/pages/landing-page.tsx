'use client'

import { useEffect, useRef, useState } from 'react'
import BusinessNav from '../components/BusinessNav'
import ScrollTopButton from '../components/ScrollTopButton'
import HeroSection from '../components/sections/HeroSection'
import StatsSection from '../components/sections/StatsSection'
import ProblemSection from '../components/sections/ProblemSection'
import StepsSection from '../components/sections/StepsSection'
import BenefitsSection from '../components/sections/BenefitsSection'
import BusinessModelSection from '../components/sections/BusinessModelSection'
import TractionSection from '../components/sections/TractionSection'
import GoToMarketSection from '../components/sections/GoToMarketSection'
import FaqSection from '../components/sections/FaqSection'
import FooterSection from '../components/sections/FooterSection'

export default function LandingPage() {
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

    return () => {
      document.body.classList.remove('landing-mode')
    }
  }, [])

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
      <BusinessNav onLogoClick={scrollToTop} />

      <main className="landing-main">
        <HeroSection onScrollToSection={scrollToSection} />
        <StatsSection />
        <ProblemSection />
        <StepsSection stepsSectionRef={stepsSectionRef} />
        <BenefitsSection />
        <BusinessModelSection />
        <TractionSection />
        <GoToMarketSection />
        <FaqSection />
      </main>
      <FooterSection onScrollToSection={scrollToSection} />
      <ScrollTopButton onClick={scrollToTop} />
    </div>
  )
}
