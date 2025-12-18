/// <reference types="vite/client" />

// Environment variables type definitions
interface ImportMetaEnv {
  readonly VITE_RECIPIENT_ADDRESS: string
  readonly VITE_USE_TESTNET: string
  readonly VITE_PRICE_VIDEO: string
  readonly VITE_PRICE_IMAGE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Extend Window interface for Ethereum provider (MetaMask, Coinbase Wallet, etc.)
interface Window {
  ethereum?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    on: (event: string, callback: (...args: unknown[]) => void) => void
    removeListener: (event: string, callback: (...args: unknown[]) => void) => void
    isMetaMask?: boolean
    isCoinbaseWallet?: boolean
  }
}