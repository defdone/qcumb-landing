type FooterSectionProps = {
  onScrollToSection: (sectionId: string, e: React.MouseEvent) => void
}

export default function FooterSection({ onScrollToSection }: FooterSectionProps) {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <div className="landing-footer-content">
          <div className="landing-footer-col landing-footer-brand">
            <div className="landing-footer-slogan">
              Monetize premium content with <span className="landing-footer-accent">qcumb</span>.
            </div>
            <div className="landing-footer-social">
              <a
                href="https://linkedin.com/company/defdone"
                className="landing-footer-social-link"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://defdone.com"
                className="landing-footer-social-link"
                aria-label="Website"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </a>
            </div>
            <div className="landing-footer-copyright">
              Copyright Defdone 2025
            </div>
          </div>

          <div className="landing-footer-col landing-footer-contact">
            <h3 className="landing-footer-heading">Get in touch</h3>
            <div className="landing-footer-contact-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <a href="mailto:hello@defdone.com">hello@defdone.com</a>
            </div>
            <div className="landing-footer-contact-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div>
                <div>Defdone</div>
                <div>Floriana Stablewskiego 43/4</div>
                <div>60-213 Poznan, Poland</div>
              </div>
            </div>
          </div>

          <div className="landing-footer-col landing-footer-links">
            <h3 className="landing-footer-heading">More</h3>
            <nav className="landing-footer-nav">
              <a href="#how-it-works" onClick={(e) => onScrollToSection('how-it-works', e)}>
                How it works
              </a>
              <a href="#benefits" onClick={(e) => onScrollToSection('benefits', e)}>
                Why qcumb
              </a>
              <a href="#model" onClick={(e) => onScrollToSection('model', e)}>
                Business model
              </a>
              <a href="#traction" onClick={(e) => onScrollToSection('traction', e)}>
                Traction
              </a>
              <a href="#go-to-market" onClick={(e) => onScrollToSection('go-to-market', e)}>
                Go-to-market
              </a>
              <a href="#faq" onClick={(e) => onScrollToSection('faq', e)}>
                FAQ
              </a>
            </nav>
          </div>
        </div>
        <div className="landing-footer-disclaimer">
          <p className="landing-footer-disclaimer-text">
            This is a test/demo website. We are not responsible for any losses, damages, or
            issues that may arise from using this service. Use at your own risk. This demo
            runs on testnet and is for demonstration purposes only.
          </p>
        </div>
      </div>
    </footer>
  )
}
