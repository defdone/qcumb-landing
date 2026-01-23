"use client"

import { useRef } from "react"
import Link from 'next/link'
import HeroVisual3D from "../HeroVisual3D"

type HeroSectionProps = {
  onScrollToSection: (sectionId: string, e: React.MouseEvent) => void
}

export default function HeroSection({ onScrollToSection }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section ref={sectionRef} className="landing-hero">
      <div className="landing-hero-bg"></div>
      <div className="landing-hero-content">
        <div className="landing-hero-text landing-animate">
          <div className="landing-hero-label">Product preview</div>
          <h1 className="landing-hero-title">
            Premium media access powered by{' '}
            <span className="landing-gradient-text">wallet authentication</span>
          </h1>
          <p className="landing-hero-description">
            Explore how accountless access, time-limited entitlements, and gasless payments
            turn anonymous visitors into customers.
          </p>
          <div className="landing-hero-cta">
            <Link className="landing-cta-primary" href="/home">
              Feel the flow
            </Link>
            <a
              href="#how-it-works"
              className="landing-cta-secondary"
              onClick={(e) => onScrollToSection('how-it-works', e)}
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
          <HeroVisual3D sectionRef={sectionRef} />
        </div>
      </div>
    </section>
  )
}
