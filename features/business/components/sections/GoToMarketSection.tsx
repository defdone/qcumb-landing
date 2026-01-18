import Link from 'next/link'

export default function GoToMarketSection() {
  return (
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
              <Link className="landing-cta-primary" href="/login">
                View product demo
              </Link>
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
  )
}
