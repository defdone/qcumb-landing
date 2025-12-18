// x402 Configuration for Base Network with USDC payments
// Based on x402 whitepaper: https://www.x402.org/x402-whitepaper.pdf

// Validate required environment variables
const validateEnv = () => {
  const recipientAddress = import.meta.env.VITE_RECIPIENT_ADDRESS
  
  if (!recipientAddress || recipientAddress === '0x0000000000000000000000000000000000000000') {
    console.warn(
      'WARNING: VITE_RECIPIENT_ADDRESS not configured. ' +
      'Please set it in your .env file. See .env.example for reference.'
    )
  }
  
  return recipientAddress || '0x0000000000000000000000000000000000000000'
}

export const X402_CONFIG = {
  // Base Mainnet Network Configuration
  network: {
    chainId: 8453,
    name: 'base-mainnet',
    rpcUrl: 'https://mainnet.base.org',
  },
  
  // Base Sepolia Testnet (for testing)
  testNetwork: {
    chainId: 84532,
    name: 'base-sepolia',
    rpcUrl: 'https://sepolia.base.org',
  },

  // USDC Contract Addresses (public, safe to hardcode)
  usdc: {
    // Base Mainnet USDC
    mainnet: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    // Base Sepolia USDC (for testing)
    sepolia: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  },

  // Payment amounts in USDC (6 decimals) - from env or defaults
  prices: {
    video: import.meta.env.VITE_PRICE_VIDEO || '1000',    // 0.001 USDC
    image: import.meta.env.VITE_PRICE_IMAGE || '1000',    // 0.001 USDC
  },

  // Recipient address from environment variable
  recipientAddress: validateEnv(),

  // Use testnet flag from environment variable
  useTestnet: import.meta.env.VITE_USE_TESTNET !== 'false',
} as const

// Get current network config based on useTestnet flag
export const getCurrentNetwork = () => {
  return X402_CONFIG.useTestnet ? X402_CONFIG.testNetwork : X402_CONFIG.network
}

// Get current USDC address based on useTestnet flag  
export const getUsdcAddress = () => {
  return X402_CONFIG.useTestnet ? X402_CONFIG.usdc.sepolia : X402_CONFIG.usdc.mainnet
}

// Format USDC amount for display (convert from 6 decimals)
export const formatUsdcAmount = (amount: string): string => {
  const value = BigInt(amount)
  const formatted = Number(value) / 1_000_000
  
  // Show more decimal places for small amounts
  if (formatted < 0.01) {
    return `$${formatted.toFixed(3)}`
  }
  return `$${formatted.toFixed(2)}`
}

// Parse USDC amount from display format to raw (6 decimals)
export const parseUsdcAmount = (displayAmount: number): string => {
  return Math.floor(displayAmount * 1_000_000).toString()
}

// x402 Payment Request type based on whitepaper spec
export interface X402PaymentRequest {
  maxAmountRequired: string
  assetType: 'ERC20'
  assetAddress: string
  paymentAddress: string
  network: string
  expiresAt: number
  nonce: string
  paymentId: string
  resource: string
  description: string
}

// x402 Payment Authorization type
export interface X402PaymentAuthorization {
  paymentRequest: X402PaymentRequest
  amount: string
  timestamp: number
  signature: string
  payerAddress: string
}

// Generate a unique payment ID
export const generatePaymentId = (): string => {
  return `pay_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

// Generate a nonce for replay attack prevention
export const generateNonce = (): string => {
  return `nonce_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

// Create x402 Payment Request
export const createX402PaymentRequest = (
  mediaType: 'video' | 'image',
  resource: string
): X402PaymentRequest => {
  const network = getCurrentNetwork()
  const usdcAddress = getUsdcAddress()
  
  return {
    maxAmountRequired: X402_CONFIG.prices[mediaType],
    assetType: 'ERC20',
    assetAddress: usdcAddress,
    paymentAddress: X402_CONFIG.recipientAddress,
    network: network.name,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes expiry
    nonce: generateNonce(),
    paymentId: generatePaymentId(),
    resource,
    description: mediaType === 'video' 
      ? 'Access to premium video content' 
      : 'Access to premium image content',
  }
}
