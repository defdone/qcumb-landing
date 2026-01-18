export default function ProblemSection() {
  return (
    <section className="landing-section landing-section-problem landing-section-alt" id="problem">
      <div className="landing-section-inner">
        <div className="landing-section-header landing-section-header-left landing-animate">
          <div className="landing-kicker">Problem</div>
          <h2 className="landing-section-title">Paid content still leaks revenue</h2>
          <p className="landing-section-subtitle">
            Users drop off when asked to create accounts, payments add friction, and access
            control is often client-side. The result is low conversion and high churn.
          </p>
        </div>
        <div className="landing-split">
          <div className="landing-panel landing-animate">
            <h3 className="landing-panel-title">Friction kills conversion</h3>
            <p className="landing-panel-text">
              Account creation, passwords, and multi-step checkout slow users down. Every
              extra step reduces paid conversion.
            </p>
          </div>
          <div className="landing-panel landing-animate">
            <h3 className="landing-panel-title">Weak access control</h3>
            <p className="landing-panel-text">
              Client-side gating and short-lived sessions leak premium content. Creators
              need server-side enforcement.
            </p>
          </div>
          <div className="landing-panel landing-animate">
            <h3 className="landing-panel-title">Payments feel expensive</h3>
            <p className="landing-panel-text">
              Users abandon checkout when gas fees and complex flows appear. The experience
              must be as simple as one tap.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
