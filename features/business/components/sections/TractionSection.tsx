export default function TractionSection() {
  return (
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
  )
}
