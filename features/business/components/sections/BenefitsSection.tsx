import {
  BackendControlInfographic,
  WalletAuthInfographic,
  TimeLimitInfographic,
  OptimizedAPIInfographic,
  PaymentFlowInfographic,
  ProductionReadyInfographic,
} from '../infographics'

export default function BenefitsSection() {
  return (
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
              Access is enforced on the backend, reducing leakage and making entitlements
              reliable for paid content.
            </p>
          </div>
          <div className="landing-benefit landing-animate">
            <div className="landing-benefit-icon">
              <TimeLimitInfographic />
            </div>
            <h3 className="landing-benefit-title">Time-limited access</h3>
            <p className="landing-benefit-description">
              Clear access windows improve conversion and reduce refunds. Expiry is automatic
              and transparent.
            </p>
          </div>
          <div className="landing-benefit landing-animate">
            <div className="landing-benefit-icon">
              <OptimizedAPIInfographic />
            </div>
            <h3 className="landing-benefit-title">Scalable API design</h3>
            <p className="landing-benefit-description">
              Efficient session and media fetching reduces cost and supports high-concurrency
              usage.
            </p>
          </div>
          <div className="landing-benefit landing-animate">
            <div className="landing-benefit-icon">
              <PaymentFlowInfographic />
            </div>
            <h3 className="landing-benefit-title">Frictionless payments</h3>
            <p className="landing-benefit-description">
              Gasless USDC flows remove payment friction and improve checkout conversion for
              premium content.
            </p>
          </div>
          <div className="landing-benefit landing-animate">
            <div className="landing-benefit-icon">
              <WalletAuthInfographic />
            </div>
            <h3 className="landing-benefit-title">Accountless onboarding</h3>
            <p className="landing-benefit-description">
              Wallet-based identity means fewer steps, fewer passwords, and higher completion
              rates.
            </p>
          </div>
          <div className="landing-benefit landing-animate">
            <div className="landing-benefit-icon">
              <ProductionReadyInfographic />
            </div>
            <h3 className="landing-benefit-title">Enterprise-ready core</h3>
            <p className="landing-benefit-description">
              Robust session management, rate limiting, and error handling allow fast
              enterprise adoption.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
