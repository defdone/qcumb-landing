// x402 Configuration
// Connects to x402-server backend

// API URL - backend server
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// Media IDs on backend
export const MEDIA_IDS = {
  video: 'video',
  image: 'image',
}

// Format USDC amount for display (convert from 6 decimals)
export const formatUsdcAmount = (amount: string): string => {
  const value = BigInt(amount)
  const formatted = Number(value) / 1_000_000
  
  if (formatted < 0.01) {
    return `$${formatted.toFixed(3)}`
  }
  return `$${formatted.toFixed(2)}`
}

// Payment requirements from 402 response
export interface PaymentRequirements {
  scheme: string
  network: string
  asset: string
  payTo: string
  amount: string
  maxAmountRequired: string
  maxTimeoutSeconds: number
  extra?: {
    name: string
    version: string
  }
}

// Full 402 response structure
export interface PaymentRequiredResponse {
  success: false
  error: string
  video?: {
    id: string
    title: string
    previewUrl?: string
  }
  paymentRequired: {
    x402Version: number
    accepts: PaymentRequirements[]
    error: string
    resource: {
      description: string
      mimeType: string
    }
  }
}

// Success response after payment
export interface PaymentSuccessResponse {
  success: true
  mediaUrl: string
  mediaType: 'video' | 'image'
  grant: {
    id: string
    mediaId: string
    payer: string
    expiresAt: number
  }
  settlement: {
    success: boolean
    transaction: string
    network: string
    payer: string
  }
}

// Signed payment payload structure
export interface SignedPaymentPayload {
  x402Version: number
  resource: {
    description: string
    mimeType: string
  }
  accepted: PaymentRequirements
  payload: {
    signature: string
    authorization: {
      from: string
      to: string
      value: string
      validAfter: string
      validBefore: string
      nonce: string
    }
  }
}