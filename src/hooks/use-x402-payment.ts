import { useState, useCallback, useEffect } from 'react'
import { 
  X402PaymentRequest, 
  createX402PaymentRequest,
  formatUsdcAmount,
  getCurrentNetwork,
  getUsdcAddress
} from '../config/x402-config'

export type PaymentStatus = 'idle' | 'connecting' | 'requesting' | 'signing' | 'confirming' | 'success' | 'error'

export interface UseX402PaymentResult {
  paymentStatus: PaymentStatus
  paymentRequest: X402PaymentRequest | null
  walletAddress: string | null
  transactionHash: string | null
  error: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  requestPayment: (mediaType: 'video' | 'image', resource: string) => Promise<X402PaymentRequest>
  executePayment: () => Promise<boolean>
  resetPayment: () => void
}

export const useX402Payment = (): UseX402PaymentResult => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle')
  const [paymentRequest, setPaymentRequest] = useState<X402PaymentRequest | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    // Restore wallet from session
    return sessionStorage.getItem('x402_wallet')
  })
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Restore wallet connection on mount
  useEffect(() => {
    const savedWallet = sessionStorage.getItem('x402_wallet')
    if (savedWallet && window.ethereum) {
      // Verify the wallet is still connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts) => {
          const accountList = accounts as string[]
          if (accountList.length > 0 && accountList[0].toLowerCase() === savedWallet.toLowerCase()) {
            setWalletAddress(accountList[0])
          } else {
            // Wallet changed or disconnected
            sessionStorage.removeItem('x402_wallet')
            setWalletAddress(null)
          }
        })
        .catch(() => {
          sessionStorage.removeItem('x402_wallet')
          setWalletAddress(null)
        })
    }
  }, [])

  // Connect wallet using window.ethereum (MetaMask, Coinbase Wallet, etc.)
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError('Nie znaleziono portfela. Zainstaluj MetaMask lub Coinbase Wallet.')
      return
    }

    try {
      setPaymentStatus('connecting')
      setError(null)

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      }) as string[]

      if (accounts.length === 0) {
        throw new Error('Nie wybrano konta')
      }

      // Switch to correct network
      const network = getCurrentNetwork()
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${network.chainId.toString(16)}` }]
        })
      } catch (switchError: unknown) {
        // If network doesn't exist, add it
        const err = switchError as { code: number }
        if (err.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${network.chainId.toString(16)}`,
              chainName: network.name === 'base-mainnet' ? 'Base' : 'Base Sepolia',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: [network.name === 'base-mainnet' 
                ? 'https://basescan.org' 
                : 'https://sepolia.basescan.org']
            }]
          })
        } else {
          throw switchError
        }
      }

      setWalletAddress(accounts[0])
      sessionStorage.setItem('x402_wallet', accounts[0])
      setPaymentStatus('idle')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Błąd połączenia z portfelem'
      setError(errorMessage)
      setPaymentStatus('error')
    }
  }, [])

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setWalletAddress(null)
    setPaymentRequest(null)
    setTransactionHash(null)
    setPaymentStatus('idle')
    setError(null)
    
    // Clear session storage
    sessionStorage.removeItem('x402_wallet')
    sessionStorage.removeItem('x402_unlocked')
  }, [])

  // Request payment (simulate HTTP 402 response)
  const requestPayment = useCallback(async (
    mediaType: 'video' | 'image', 
    resource: string
  ): Promise<X402PaymentRequest> => {
    setPaymentStatus('requesting')
    setError(null)

    // Create x402 Payment Request (as per whitepaper spec)
    const request = createX402PaymentRequest(mediaType, resource)
    
    console.log('x402 Payment Required (HTTP 402):', {
      status: 402,
      statusText: 'Payment Required',
      headers: {
        'Content-Type': 'application/json',
        'X-Payment-Required': JSON.stringify(request)
      },
      body: request
    })

    setPaymentRequest(request)
    setPaymentStatus('idle')
    
    return request
  }, [])

  // Execute the actual payment transaction
  const executePayment = useCallback(async (): Promise<boolean> => {
    if (!window.ethereum || !walletAddress || !paymentRequest) {
      setError('Brak portfela lub żądania płatności')
      return false
    }

    try {
      setPaymentStatus('signing')
      setError(null)

      const usdcAddress = getUsdcAddress()
      
      // Encode the transfer function call
      // transfer(address to, uint256 amount)
      const transferData = encodeTransferData(
        paymentRequest.paymentAddress,
        paymentRequest.maxAmountRequired
      )

      // Send transaction
      setPaymentStatus('confirming')
      
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: usdcAddress,
          data: transferData,
          // Gas will be estimated automatically
        }]
      }) as string

      console.log('x402 Payment Transaction:', {
        txHash,
        from: walletAddress,
        to: paymentRequest.paymentAddress,
        amount: formatUsdcAmount(paymentRequest.maxAmountRequired),
        asset: 'USDC',
        network: paymentRequest.network
      })

      setTransactionHash(txHash)
      setPaymentStatus('success')
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Błąd transakcji'
      setError(errorMessage)
      setPaymentStatus('error')
      return false
    }
  }, [walletAddress, paymentRequest])

  // Reset payment state
  const resetPayment = useCallback(() => {
    setPaymentRequest(null)
    setTransactionHash(null)
    setPaymentStatus('idle')
    setError(null)
  }, [])

  return {
    paymentStatus,
    paymentRequest,
    walletAddress,
    transactionHash,
    error,
    connectWallet,
    disconnectWallet,
    requestPayment,
    executePayment,
    resetPayment
  }
}

// Helper function to encode ERC20 transfer call
function encodeTransferData(to: string, amount: string): string {
  // Function selector for transfer(address,uint256)
  const functionSelector = '0xa9059cbb'
  
  // Pad address to 32 bytes (remove 0x prefix, pad to 64 chars)
  const paddedAddress = to.toLowerCase().replace('0x', '').padStart(64, '0')
  
  // Convert amount to hex and pad to 32 bytes
  const amountHex = BigInt(amount).toString(16).padStart(64, '0')
  
  return functionSelector + paddedAddress + amountHex
}
