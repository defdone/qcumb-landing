import Link from 'next/link'

type BusinessNavProps = {
  onLogoClick: (e?: React.MouseEvent) => void
}

export default function BusinessNav({ onLogoClick }: BusinessNavProps) {
  return (
    <nav className="landing-nav">
      <div className="landing-nav-inner">
        <div className="landing-logo-wrapper" onClick={onLogoClick}>
          <img
            src="/logoQC - base - H.png"
            alt="qcumb"
            className="landing-logo-img"
          />
        </div>
        <div className="landing-nav-actions">
          <Link className="landing-nav-cta" href="/login">
            Feel the flow
          </Link>
        </div>
      </div>
    </nav>
  )
}
