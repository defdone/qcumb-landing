type ScrollTopButtonProps = {
  onClick: (e?: React.MouseEvent) => void
}

export default function ScrollTopButton({ onClick }: ScrollTopButtonProps) {
  return (
    <button className="landing-scroll-top" onClick={onClick} aria-label="Scroll to top">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  )
}
