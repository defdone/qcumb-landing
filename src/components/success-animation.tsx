import { useEffect, useState } from 'react'
import './success-animation.css'

interface SuccessAnimationProps {
  show: boolean
  onComplete?: () => void
}

export default function SuccessAnimation({ show, onComplete }: SuccessAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!show || !isVisible) return null

  return (
    <div className="success-animation-overlay">
      <div className="success-animation-content">
        <div className="success-checkmark">
          <svg viewBox="0 0 52 52">
            <circle className="success-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="success-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>
        <h3 className="success-title">Payment Successful!</h3>
        <p className="success-message">Your access has been granted</p>
      </div>
    </div>
  )
}

