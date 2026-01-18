export default function FaqSection() {
  return (
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
  )
}
