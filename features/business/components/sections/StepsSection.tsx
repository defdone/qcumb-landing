import type { RefObject } from 'react'

type StepsSectionProps = {
  stepsSectionRef: RefObject<HTMLElement>
}

export default function StepsSection({ stepsSectionRef }: StepsSectionProps) {
  return (
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
              Wallet is the identity. No email, password, or account creation. One click to
              start a session.
            </p>
          </div>
          <div className="landing-step-connector" data-connector="1"></div>
          <div className="landing-step" data-step="2">
            <div className="landing-step-icon">02</div>
            <h3 className="landing-step-title">Session verification</h3>
            <p className="landing-step-description">
              Backend verifies the session and returns entitlements instantly. Server is the
              source of truth.
            </p>
          </div>
          <div className="landing-step-connector" data-connector="2"></div>
          <div className="landing-step" data-step="3">
            <div className="landing-step-icon">03</div>
            <h3 className="landing-step-title">Purchase access</h3>
            <p className="landing-step-description">
              User selects a plan and signs a gasless USDC authorization. The backend executes
              payment.
            </p>
          </div>
          <div className="landing-step-connector" data-connector="3"></div>
          <div className="landing-step" data-step="4">
            <div className="landing-step-icon">04</div>
            <h3 className="landing-step-title">Access content</h3>
            <p className="landing-step-description">
              Access is granted instantly and expires automatically. Clear, predictable access
              windows.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
