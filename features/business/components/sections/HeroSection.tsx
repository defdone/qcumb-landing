import Link from 'next/link'

type HeroSectionProps = {
  onScrollToSection: (sectionId: string, e: React.MouseEvent) => void
}

export default function HeroSection({ onScrollToSection }: HeroSectionProps) {
  return (
    <section className="landing-hero">
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
            <Link className="landing-cta-primary" href="/login">
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
  )
}
