// Simple, professional infographics for landing page
// Minimalist style to avoid AI-generated look

export const BackendControlInfographic = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Server box */}
    <rect x="20" y="30" width="80" height="60" rx="4" stroke="url(#gradient1)" strokeWidth="2" fill="none" opacity="0.3"/>
    <line x1="30" y1="50" x2="90" y2="50" stroke="url(#gradient1)" strokeWidth="1.5" opacity="0.6"/>
    <line x1="30" y1="65" x2="90" y2="65" stroke="url(#gradient1)" strokeWidth="1.5" opacity="0.6"/>
    <line x1="30" y1="80" x2="70" y2="80" stroke="url(#gradient1)" strokeWidth="1.5" opacity="0.6"/>
    
    {/* Client boxes */}
    <rect x="10" y="10" width="30" height="20" rx="2" stroke="url(#gradient1)" strokeWidth="1.5" fill="none" opacity="0.4"/>
    <rect x="80" y="10" width="30" height="20" rx="2" stroke="url(#gradient1)" strokeWidth="1.5" fill="none" opacity="0.4"/>
    
    {/* Arrows */}
    <path d="M25 20 L50 40" stroke="url(#gradient1)" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)"/>
    <path d="M95 20 L70 40" stroke="url(#gradient1)" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)"/>
    
    <defs>
      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0066ff" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
      <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <polygon points="0 0, 6 3, 0 6" fill="url(#gradient1)" />
      </marker>
    </defs>
  </svg>
)

export const WalletAuthInfographic = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Wallet icon */}
    <rect x="40" y="20" width="40" height="50" rx="4" stroke="url(#gradient2)" strokeWidth="2" fill="none"/>
    <rect x="45" y="30" width="30" height="8" rx="1" fill="url(#gradient2)" opacity="0.3"/>
    <circle cx="60" cy="50" r="8" stroke="url(#gradient2)" strokeWidth="2" fill="none"/>
    
    {/* Lock icon */}
    <rect x="50" y="75" width="20" height="25" rx="2" stroke="url(#gradient2)" strokeWidth="2" fill="none"/>
    <path d="M50 75 L50 65 Q50 60 55 60 L65 60 Q70 60 70 65 L70 75" stroke="url(#gradient2)" strokeWidth="2" fill="none"/>
    
    {/* Checkmark */}
    <path d="M55 85 L60 90 L75 75" stroke="url(#gradient2)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    
    <defs>
      <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0066ff" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
    </defs>
  </svg>
)

export const DecentralizedStorageInfographic = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Central node */}
    <circle cx="60" cy="60" r="15" fill="url(#gradient3)" opacity="0.3"/>
    <circle cx="60" cy="60" r="8" fill="url(#gradient3)"/>
    
    {/* Decentralized nodes */}
    <circle cx="30" cy="30" r="10" stroke="url(#gradient3)" strokeWidth="2" fill="none" opacity="0.6"/>
    <circle cx="90" cy="30" r="10" stroke="url(#gradient3)" strokeWidth="2" fill="none" opacity="0.6"/>
    <circle cx="30" cy="90" r="10" stroke="url(#gradient3)" strokeWidth="2" fill="none" opacity="0.6"/>
    <circle cx="90" cy="90" r="10" stroke="url(#gradient3)" strokeWidth="2" fill="none" opacity="0.6"/>
    
    {/* Connection lines */}
    <line x1="60" y1="60" x2="30" y2="30" stroke="url(#gradient3)" strokeWidth="1.5" opacity="0.4"/>
    <line x1="60" y1="60" x2="90" y2="30" stroke="url(#gradient3)" strokeWidth="1.5" opacity="0.4"/>
    <line x1="60" y1="60" x2="30" y2="90" stroke="url(#gradient3)" strokeWidth="1.5" opacity="0.4"/>
    <line x1="60" y1="60" x2="90" y2="90" stroke="url(#gradient3)" strokeWidth="1.5" opacity="0.4"/>
    
    <defs>
      <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0066ff" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
    </defs>
  </svg>
)

export const ContentProtectionInfographic = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Content frame */}
    <rect x="20" y="25" width="80" height="50" rx="4" stroke="url(#gradient4)" strokeWidth="2" fill="none" opacity="0.3"/>
    <rect x="25" y="30" width="70" height="40" rx="2" fill="url(#gradient4)" opacity="0.1"/>
    
    {/* Blur effect lines */}
    <line x1="30" y1="40" x2="90" y2="40" stroke="url(#gradient4)" strokeWidth="1" opacity="0.3"/>
    <line x1="30" y1="50" x2="90" y2="50" stroke="url(#gradient4)" strokeWidth="1" opacity="0.3"/>
    <line x1="30" y1="60" x2="90" y2="60" stroke="url(#gradient4)" strokeWidth="1" opacity="0.3"/>
    
    {/* Shield overlay */}
    <path d="M60 80 L45 90 L45 85 Q45 75 55 75 L65 75 Q75 75 75 85 L75 90 Z" stroke="url(#gradient4)" strokeWidth="2" fill="none"/>
    <line x1="60" y1="80" x2="60" y2="90" stroke="url(#gradient4)" strokeWidth="2"/>
    
    <defs>
      <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0066ff" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
    </defs>
  </svg>
)

export const WatermarkInfographic = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Content area */}
    <rect x="20" y="20" width="80" height="60" rx="4" stroke="url(#gradient5)" strokeWidth="1.5" fill="none" opacity="0.2"/>
    
    {/* Watermark pattern (subtle) */}
    <text x="60" y="50" fontSize="24" fill="url(#gradient5)" opacity="0.15" textAnchor="middle" fontWeight="700">DD</text>
    
    {/* Detection indicator */}
    <circle cx="100" cy="20" r="8" fill="url(#gradient5)" opacity="0.8"/>
    <path d="M96 20 L99 23 L104 18" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    
    {/* Scan lines */}
    <line x1="25" y1="35" x2="95" y2="35" stroke="url(#gradient5)" strokeWidth="0.5" opacity="0.3"/>
    <line x1="25" y1="50" x2="95" y2="50" stroke="url(#gradient5)" strokeWidth="0.5" opacity="0.3"/>
    <line x1="25" y1="65" x2="95" y2="65" stroke="url(#gradient5)" strokeWidth="0.5" opacity="0.3"/>
    
    <defs>
      <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0066ff" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
    </defs>
  </svg>
)

export const PaymentFlowInfographic = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Wallet */}
    <rect x="15" y="50" width="25" height="35" rx="3" stroke="url(#gradient6)" strokeWidth="2" fill="none"/>
    <circle cx="27.5" cy="67.5" r="5" fill="url(#gradient6)" opacity="0.3"/>
    
    {/* Arrow */}
    <path d="M45 67.5 L65 67.5" stroke="url(#gradient6)" strokeWidth="2" fill="none" markerEnd="url(#arrowhead2)"/>
    
    {/* Server */}
    <rect x="70" y="45" width="35" height="45" rx="3" stroke="url(#gradient6)" strokeWidth="2" fill="none" opacity="0.3"/>
    <line x1="75" y1="55" x2="100" y2="55" stroke="url(#gradient6)" strokeWidth="1.5" opacity="0.5"/>
    <line x1="75" y1="65" x2="100" y2="65" stroke="url(#gradient6)" strokeWidth="1.5" opacity="0.5"/>
    
    {/* Success check */}
    <circle cx="87.5" cy="80" r="8" fill="url(#gradient6)" opacity="0.8"/>
    <path d="M83 80 L86 83 L92 77" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
    
    <defs>
      <linearGradient id="gradient6" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0066ff" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
      <marker id="arrowhead2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <polygon points="0 0, 6 3, 0 6" fill="url(#gradient6)" />
      </marker>
    </defs>
  </svg>
)

export const TimeLimitInfographic = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Clock */}
    <circle cx="60" cy="60" r="35" stroke="url(#gradient7)" strokeWidth="2.5" fill="none"/>
    <circle cx="60" cy="60" r="4" fill="url(#gradient7)"/>
    <line x1="60" y1="60" x2="60" y2="35" stroke="url(#gradient7)" strokeWidth="2" strokeLinecap="round"/>
    <line x1="60" y1="60" x2="75" y2="60" stroke="url(#gradient7)" strokeWidth="2" strokeLinecap="round"/>
    
    {/* Time labels */}
    <text x="60" y="20" fontSize="10" fill="url(#gradient7)" textAnchor="middle" opacity="0.7">24h / 7d</text>
    
    {/* Expiry indicator */}
    <path d="M30 90 Q30 75 45 75 L75 75 Q90 75 90 90" stroke="url(#gradient7)" strokeWidth="2" fill="none" opacity="0.5"/>
    
    <defs>
      <linearGradient id="gradient7" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0066ff" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
    </defs>
  </svg>
)

export const OptimizedAPIInfographic = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* API endpoint */}
    <rect x="20" y="40" width="80" height="40" rx="4" stroke="url(#gradient8)" strokeWidth="2" fill="none" opacity="0.3"/>
    <line x1="30" y1="52" x2="90" y2="52" stroke="url(#gradient8)" strokeWidth="1.5" opacity="0.6"/>
    <line x1="30" y1="65" x2="90" y2="65" stroke="url(#gradient8)" strokeWidth="1.5" opacity="0.6"/>
    
    {/* Debounce indicator */}
    <circle cx="40" cy="20" r="8" fill="url(#gradient8)" opacity="0.4"/>
    <circle cx="60" cy="20" r="8" fill="url(#gradient8)" opacity="0.6"/>
    <circle cx="80" cy="20" r="8" fill="url(#gradient8)" opacity="0.8"/>
    
    {/* Scale indicator */}
    <path d="M20 95 L100 95" stroke="url(#gradient8)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M20 95 L30 85 L50 90 L70 85 L90 90 L100 95" stroke="url(#gradient8)" strokeWidth="2" fill="none" opacity="0.7"/>
    
    <defs>
      <linearGradient id="gradient8" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0066ff" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
    </defs>
  </svg>
)

export const ProductionReadyInfographic = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Shield */}
    <path d="M60 25 L45 30 L45 50 Q45 70 60 85 Q75 70 75 50 L75 30 Z" stroke="url(#gradient9)" strokeWidth="2.5" fill="none"/>
    <line x1="60" y1="25" x2="60" y2="85" stroke="url(#gradient9)" strokeWidth="2.5"/>
    
    {/* Checkmarks */}
    <circle cx="50" cy="55" r="6" fill="url(#gradient9)" opacity="0.8"/>
    <path d="M47 55 L49 57 L53 53" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    
    <circle cx="70" cy="55" r="6" fill="url(#gradient9)" opacity="0.8"/>
    <path d="M67 55 L69 57 L73 53" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    
    {/* Bottom check */}
    <circle cx="60" cy="70" r="6" fill="url(#gradient9)" opacity="0.8"/>
    <path d="M57 70 L59 72 L63 68" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    
    <defs>
      <linearGradient id="gradient9" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0066ff" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
    </defs>
  </svg>
)

export const TransparentRevenueInfographic = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Chart bars */}
    <rect x="25" y="60" width="15" height="35" rx="2" fill="url(#gradient10)" opacity="0.7"/>
    <rect x="45" y="45" width="15" height="50" rx="2" fill="url(#gradient10)" opacity="0.8"/>
    <rect x="65" y="30" width="15" height="65" rx="2" fill="url(#gradient10)" opacity="0.9"/>
    <rect x="85" y="50" width="15" height="45" rx="2" fill="url(#gradient10)" opacity="0.7"/>
    
    {/* Dollar sign */}
    <text x="60" y="25" fontSize="20" fill="url(#gradient10)" textAnchor="middle" fontWeight="700" opacity="0.8">$</text>
    
    {/* Transparency lines */}
    <line x1="20" y1="100" x2="100" y2="100" stroke="url(#gradient10)" strokeWidth="1" opacity="0.3"/>
    <line x1="20" y1="95" x2="100" y2="95" stroke="url(#gradient10)" strokeWidth="1" opacity="0.3"/>
    
    <defs>
      <linearGradient id="gradient10" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0066ff" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
    </defs>
  </svg>
)

export const CreatorRegistrationInfographic = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* User icon */}
    <circle cx="60" cy="35" r="15" stroke="url(#gradient11)" strokeWidth="2.5" fill="none"/>
    <path d="M35 85 Q35 70 60 70 Q85 70 85 85" stroke="url(#gradient11)" strokeWidth="2.5" fill="none"/>
    
    {/* Plus sign */}
    <circle cx="60" cy="50" r="12" fill="url(#gradient11)" opacity="0.2"/>
    <line x1="60" y1="44" x2="60" y2="56" stroke="url(#gradient11)" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="54" y1="50" x2="66" y2="50" stroke="url(#gradient11)" strokeWidth="2.5" strokeLinecap="round"/>
    
    {/* Arrow down */}
    <path d="M60 95 L60 105 M55 100 L60 105 L65 100" stroke="url(#gradient11)" strokeWidth="2" fill="none" strokeLinecap="round"/>
    
    <defs>
      <linearGradient id="gradient11" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0066ff" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
    </defs>
  </svg>
)

export const Web3MonetizationInfographic = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Blockchain blocks */}
    <rect x="25" y="30" width="20" height="20" rx="2" stroke="url(#gradient12)" strokeWidth="2" fill="none" opacity="0.6"/>
    <rect x="50" y="30" width="20" height="20" rx="2" stroke="url(#gradient12)" strokeWidth="2" fill="none" opacity="0.7"/>
    <rect x="75" y="30" width="20" height="20" rx="2" stroke="url(#gradient12)" strokeWidth="2" fill="none" opacity="0.8"/>
    
    {/* Connection lines */}
    <line x1="45" y1="40" x2="50" y2="40" stroke="url(#gradient12)" strokeWidth="1.5" opacity="0.5"/>
    <line x1="70" y1="40" x2="75" y2="40" stroke="url(#gradient12)" strokeWidth="1.5" opacity="0.5"/>
    
    {/* Wallet at bottom */}
    <rect x="40" y="70" width="40" height="25" rx="3" stroke="url(#gradient12)" strokeWidth="2" fill="none"/>
    <circle cx="50" cy="82.5" r="4" fill="url(#gradient12)" opacity="0.3"/>
    
    {/* Money flow */}
    <path d="M60 55 Q60 65 60 70" stroke="url(#gradient12)" strokeWidth="2" fill="none" markerEnd="url(#arrowhead3)"/>
    
    <defs>
      <linearGradient id="gradient12" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0066ff" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
      <marker id="arrowhead3" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <polygon points="0 0, 6 3, 0 6" fill="url(#gradient12)" />
      </marker>
    </defs>
  </svg>
)

