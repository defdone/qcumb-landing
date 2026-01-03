import './skeleton-loader.css'

interface SkeletonLoaderProps {
  count?: number
  className?: string
}

export default function SkeletonLoader({ count = 1, className = '' }: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton-card ${className}`}>
          <div className="skeleton-header">
            <div className="skeleton-line skeleton-title"></div>
            <div className="skeleton-line skeleton-badge"></div>
          </div>
          <div className="skeleton-media">
            <div className="skeleton-preview"></div>
          </div>
        </div>
      ))}
    </>
  )
}

