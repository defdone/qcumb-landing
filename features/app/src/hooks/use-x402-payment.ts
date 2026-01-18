import { useState, useCallback, useEffect } from 'react'
import { recoverTypedDataAddress } from 'viem'
import { useAccount, useConnect, useDisconnect, useWalletClient } from 'wagmi'
import {
  API_URL,
  PaymentRequirements,
  PaymentRequiredResponse,
  PaymentSuccessResponse,
  SignedPaymentPayload,
} from '../../../auth/config/x402-config'

export type PaymentStatus = 'idle' | 'connecting' | 'requesting' | 'signing' | 'settling' | 'success' | 'error'
export type PlanType = '24h' | '7d'

export interface PlanPricing {
  '24h': {
    price: number
    priceFormatted: string
    amount: string // raw amount in smallest unit
  }
  '7d': {
    price: number
    priceFormatted: string
    amount: string
  }
}

export interface UseX402PaymentResult {
  paymentStatus: PaymentStatus
  paymentRequirements: PaymentRequirements | null
  walletAddress: string | null
  mediaUrl: string | null
  transactionHash: string | null
  error: string | null
  pricing: PlanPricing | null
  selectedPlan: PlanType
  entitlementId: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  requestPayment: (
    mediaId: string,
    mediaType: 'video' | 'image',
    sessionHeader?: Record<string, string>
  ) => Promise<PaymentRequirements | null>
  executePayment: (sessionHeader?: Record<string, string>) => Promise<boolean>
  resetPayment: () => void
  setSelectedPlan: (plan: PlanType) => void
}

// EIP-712 types for TransferWithAuthorization (EIP-3009)
const TRANSFER_AUTH_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
}

// Generate random nonce (32 bytes)
function generateNonce(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return '0x' + Array.from(array).map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Get chain ID from network string (e.g., "eip155:84532" -> 84532)
function getChainIdFromNetwork(network: string): number {
  if (network.startsWith('eip155:')) {
    return parseInt(network.split(':')[1], 10)
  }
  // Fallback for legacy names
  const networkMap: Record<string, number> = {
    'base-sepolia': 84532,
    base: 8453,
  }
  return networkMap[network] || 84532
}

// Convert price to raw amount (6 decimals for USDC)
function priceToAmount(price: number): string {
  return String(Math.round(price * 1_000_000))
}

export const useX402Payment = (): UseX402PaymentResult => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle')
  const [paymentRequirements, setPaymentRequirements] = useState<PaymentRequirements | null>(null)
  const [currentMediaType, setCurrentMediaType] = useState<'video' | 'image' | null>(null)
  const [currentMediaId, setCurrentMediaId] = useState<string | null>(null)
  const [resourceInfo, setResourceInfo] = useState<{ description: string; mimeType: string } | null>(null)
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const { connect, connectors } = useConnect()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const [pricing, setPricing] = useState<PlanPricing | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('24h')
  const [entitlementId, setEntitlementId] = useState<string | null>(null)

  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Store session header for use in executePayment
  const [currentSessionHeader, setCurrentSessionHeader] = useState<Record<string, string>>({})

  useEffect(() => {
    if (address) {
      setWalletAddress(address)
      try {
        sessionStorage.removeItem('x402_disconnected')
      } catch {}
    } else {
      setWalletAddress(null)
    }
  }, [address])

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!connect || connectors.length === 0) {
      setError('No wallet connectors available')
      return
    }
    try {
      setPaymentStatus('connecting')
      setError(null)
      await connect({ connector: connectors[0] })
      setPaymentStatus('idle')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Wallet connection error'
      setError(errorMessage)
      setPaymentStatus('error')
    }
  }, [connect, connectors])

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    try {
      wagmiDisconnect()
    } catch {}
    setWalletAddress(null)
    setPaymentRequirements(null)
    setCurrentMediaId(null)
    setMediaUrl(null)
    setTransactionHash(null)
    setPaymentStatus('idle')
    setError(null)
    setPricing(null)
    setEntitlementId(null)
    // Mark as manually disconnected so we don't auto-connect on refresh
    try {
      sessionStorage.setItem('x402_disconnected', 'true')
    } catch {}
  }, [wagmiDisconnect])

  // Request payment (get 402 response from backend)
  const requestPayment = useCallback(
    async (
      mediaId: string,
      mediaType: 'video' | 'image',
      sessionHeader: Record<string, string> = {}
    ): Promise<PaymentRequirements | null> => {
      setPaymentStatus('requesting')
      setError(null)
      setCurrentMediaId(mediaId)
      setCurrentMediaType(mediaType)
      setCurrentSessionHeader(sessionHeader)

      try {
        const response = await fetch(`${API_URL}/media/${mediaId}/access`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...sessionHeader,
          },
          body: JSON.stringify({
            planType: selectedPlan,
          }),
        })

        if (response.status === 402) {
          const data: PaymentRequiredResponse = await response.json()

          console.log('x402 Payment Required (HTTP 402):', data)

          // Extract pricing from response
          const pricingData = (data as any).pricing
          if (pricingData) {
            setPricing({
              '24h': {
                price: pricingData['24h']?.price || 0.01,
                priceFormatted: pricingData['24h']?.priceFormatted || '$0.01',
                amount: priceToAmount(pricingData['24h']?.price || 0.01),
              },
              '7d': {
                price: pricingData['7d']?.price || 0.05,
                priceFormatted: pricingData['7d']?.priceFormatted || '$0.05',
                amount: priceToAmount(pricingData['7d']?.price || 0.05),
              },
            })
          }

          const requirements = data.paymentRequired.accepts[0]
          setPaymentRequirements(requirements)
          setResourceInfo(data.paymentRequired.resource)
          setPaymentStatus('idle')

          return requirements
        } else if (response.ok) {
          // Already have access
          const data: PaymentSuccessResponse = await response.json()
          setMediaUrl(data.mediaUrl)
          setPaymentStatus('success')
          return null
        } else {
          throw new Error('Failed to get payment requirements')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Request error'
        setError(errorMessage)
        setPaymentStatus('error')
        return null
      }
    },
    [selectedPlan]
  )

  // Execute payment (sign EIP-3009 authorization and submit to backend)
  const executePayment = useCallback(
    async (sessionHeader: Record<string, string> = {}): Promise<boolean> => {
      if (
        !window.ethereum ||
        !walletAddress ||
        !paymentRequirements ||
        !currentMediaType ||
        !currentMediaId ||
        !resourceInfo
      ) {
        setError('Missing wallet or payment requirements')
        return false
      }

      // Use provided session header or stored one
      const headers = Object.keys(sessionHeader).length > 0 ? sessionHeader : currentSessionHeader

      try {
        setPaymentStatus('signing')
        setError(null)

        // Switch to correct network
        const chainId = getChainIdFromNetwork(paymentRequirements.network)
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${chainId.toString(16)}` }],
          })
        } catch (switchError: unknown) {
          const err = switchError as { code: number }
          if (err.code === 4902) {
            setError('Please add Base Sepolia network to your wallet')
          } else {
            setError('Failed to switch network')
          }
          setPaymentStatus('error')
          return false
        }

        const now = Math.floor(Date.now() / 1000)
        const timeoutSeconds = paymentRequirements.maxTimeoutSeconds ?? 300
        const authorization = {
          from: walletAddress,
          to: paymentRequirements.payTo,
          value: BigInt(paymentRequirements.amount),
          validAfter: 0n,
          validBefore: BigInt(now + timeoutSeconds),
          nonce: generateNonce(),
        }

        const verifyingContract = paymentRequirements.asset as `0x${string}`
        const domain = {
          name: paymentRequirements.extra?.name ?? 'USDC',
          version: paymentRequirements.extra?.version ?? '2',
          chainId,
          verifyingContract,
        }

        console.log('domain', domain)
        console.log('accepted', paymentRequirements)
        console.log('authorization', authorization)

        const payload: SignedPaymentPayload = {
          x402Version: 2,
          resource: {
            description: resourceInfo.description,
            mimeType: resourceInfo.mimeType,
          },
          accepted: paymentRequirements,
          payload: {
            authorization: {
              from: authorization.from,
              to: authorization.to,
              value: String(paymentRequirements.amount),
              validAfter: '0',
              validBefore: String(now + timeoutSeconds),
              nonce: authorization.nonce,
            },
            signature: '',
          },
        }

        // Sign EIP-712 typed data
        if (!walletClient) {
          setError('Wallet client not ready')
          setPaymentStatus('error')
          return false
        }

        const signature = await walletClient.signTypedData({
          account: walletAddress as `0x${string}`,
          domain,
          types: TRANSFER_AUTH_TYPES,
          primaryType: 'TransferWithAuthorization',
          message: authorization,
        })

        payload.payload.signature = signature

        try {
          const recovered = await recoverTypedDataAddress({
            domain,
            types: TRANSFER_AUTH_TYPES as any,
            primaryType: 'TransferWithAuthorization',
            message: authorization,
            signature,
          })
          console.log('recovered', recovered, 'expected', authorization.from)
        } catch (err) {
          console.warn('recoverTypedDataAddress failed', err)
        }

        setPaymentStatus('settling')

        const response = await fetch(`${API_URL}/media/${currentMediaId}/access`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify({
            planType: selectedPlan,
            message: {
              metadata: {
                'x402.payment.payload': payload,
                'x402.payment.status': 'payment-submitted',
              },
            },
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Payment failed')
        }

        const data: PaymentSuccessResponse = await response.json()
        setMediaUrl(data.mediaUrl)
        setEntitlementId(data.grant?.id || null)
        setTransactionHash(data.settlement?.transaction || null)
        setPaymentStatus('success')

        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Payment error'
        setError(errorMessage)
        setPaymentStatus('error')
        return false
      }
    },
    [
      walletAddress,
      paymentRequirements,
      currentMediaType,
      currentMediaId,
      resourceInfo,
      currentSessionHeader,
      selectedPlan,
    ]
  )

  const resetPayment = useCallback(() => {
    setPaymentStatus('idle')
    setPaymentRequirements(null)
    setMediaUrl(null)
    setTransactionHash(null)
    setError(null)
    setPricing(null)
    setEntitlementId(null)
  }, [])

  return {
    paymentStatus,
    paymentRequirements,
    walletAddress,
    mediaUrl,
    transactionHash,
    error,
    pricing,
    selectedPlan,
    entitlementId,
    connectWallet,
    disconnectWallet,
    requestPayment,
    executePayment,
    resetPayment,
    setSelectedPlan,
  }
}
