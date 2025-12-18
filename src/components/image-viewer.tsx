interface ImageViewerProps {
  isLocked: boolean
  onPaymentRequest: () => void
}

const ImageViewer: React.FC<ImageViewerProps> = ({ isLocked, onPaymentRequest }) => {
  const handleClick = (): void => {
    if (isLocked) {
      onPaymentRequest()
    }
  }

  return (
    <div className={`media-container ${isLocked ? 'locked' : 'unlocked'}`} onClick={isLocked ? handleClick : undefined}>
      <img
        src="/image.jpg"
        alt="Premium content"
        className={`image-viewer ${isLocked ? 'blurred' : ''}`}
      />
      
      {isLocked && (
        <div className="paywall-overlay">
          <div className="paywall-content">
            <div className="paywall-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div className="paywall-text">Premium Content</div>
            <button className="paywall-button">
              <span className="x402-badge">402</span>
              Unlock Image
            </button>
          </div>
        </div>
      )}
      
      {!isLocked && <div className="unlock-badge">Unlocked</div>}
    </div>
  )
}

export default ImageViewer