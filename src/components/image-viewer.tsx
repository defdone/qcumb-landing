import { useState } from 'react'
import { API_URL } from '../config/x402-config'

interface ImageViewerProps {
  isLocked: boolean
  onPaymentRequest: () => void
  mediaUrl?: string | null
  serverOnline?: boolean | null
}

const ImageViewer: React.FC<ImageViewerProps> = ({ isLocked, onPaymentRequest, mediaUrl, serverOnline }) => {
  const [hasError, setHasError] = useState(false)

  const handleClick = (): void => {
    if (isLocked && serverOnline) {
      onPaymentRequest()
    }
  }

  // Use preview endpoint when locked, mediaUrl with token when unlocked
  const imageSrc = isLocked 
    ? `${API_URL}/media/preview/image`
    : mediaUrl || `${API_URL}/media/preview/image`

  const showPlaceholder = serverOnline === false || hasError

  return (
    <div className={`media-container ${isLocked ? 'locked' : 'unlocked'}`} onClick={isLocked ? handleClick : undefined}>
      {showPlaceholder ? (
        <div className="media-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span>{serverOnline === false ? 'Server Offline' : 'Failed to load'}</span>
        </div>
      ) : (
        <img
          src={imageSrc}
          alt="Premium content"
          className={`image-viewer ${isLocked ? 'blurred' : ''}`}
          onError={() => setHasError(true)}
          onLoad={() => setHasError(false)}
        />
      )}
      
      {isLocked && !showPlaceholder && (
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
      
      {!isLocked && !showPlaceholder && <div className="unlock-badge">Unlocked</div>}
    </div>
  )
}

export default ImageViewer