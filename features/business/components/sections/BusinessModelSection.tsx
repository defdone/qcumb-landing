import {
  DecentralizedStorageInfographic,
  ContentProtectionInfographic,
  WatermarkInfographic,
  TransparentRevenueInfographic,
  CreatorRegistrationInfographic,
  Web3MonetizationInfographic,
} from '../infographics'

export default function BusinessModelSection() {
  return (
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
              Percentage-based fee on premium access purchases. Scales with creator revenue
              and platform growth.
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
              White-label and API licensing for platforms that need secure access gating and
              payments.
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
              On-chain payments allow flexible pricing, bundles, and time-based access
              models.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
